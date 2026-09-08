package com.citizen.service.controller;

import com.citizen.service.entity.RequestStatus;
import com.citizen.service.entity.Role;
import com.citizen.service.entity.ServiceRequest;
import com.citizen.service.entity.User;
import com.citizen.service.exception.ResourceNotFoundException;
import com.citizen.service.exception.UnauthorizedException;
import com.citizen.service.repository.ServiceRequestRepository;
import com.citizen.service.repository.UserRepository;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;

    private static final DeviceRgb BRAND_BLUE = new DeviceRgb(20, 121, 232);
    private static final DeviceRgb NAVY_DARK = new DeviceRgb(15, 23, 42);
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(248, 250, 252);
    private static final DeviceRgb TABLE_HEADER_BG = new DeviceRgb(30, 41, 59);
    private static final DeviceRgb BORDER_COLOR = new DeviceRgb(226, 232, 240);

    public ReportController(ServiceRequestRepository requestRepository, UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    /**
     * Download a single service request as PDF.
     * ADMIN can download any; USER can only download their own.
     */
    @GetMapping("/request/{id}")
    public ResponseEntity<byte[]> downloadSingleRequestPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));

        // Ownership check for citizens
        if (currentUser.getRole() != Role.ROLE_ADMIN && !request.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: You can only download your own service request details.");
        }

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        byte[] pdfBytes = generateSingleRequestPdf(request, isAdmin);

        String filename = "request-" + request.getRequestId() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    /**
     * ADMIN: Download filtered service requests report as PDF.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<byte[]> downloadAllRequestsReport(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<ServiceRequest> requests = requestRepository.filterAdminRequests(
                status, category, search != null ? search.trim() : null);

        byte[] pdfBytes = generateAdminReportPdf(requests, status, category, search);

        String filename = "citizen-service-report-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // ======== PDF Generation Helpers ========

    private byte[] generateSingleRequestPdf(ServiceRequest req, boolean isAdmin) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(40, 50, 40, 50);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd MMM yyyy");

        // Header Banner
        addHeader(document, "Service Request Details");

        // Request ID Banner
        Table idBanner = new Table(UnitValue.createPercentArray(new float[]{1})).useAllAvailableWidth();
        Cell idCell = new Cell()
                .add(new Paragraph("Request ID: " + req.getRequestId())
                        .setFontSize(16)
                        .setBold()
                        .setFontColor(BRAND_BLUE))
                .setPadding(12)
                .setBackgroundColor(LIGHT_BG)
                .setBorder(new SolidBorder(BRAND_BLUE, 2));
        idBanner.addCell(idCell);
        document.add(idBanner);
        document.add(new Paragraph("\n").setFontSize(6));

        // Status Badge inline
        String statusText = req.getStatus() != null ? req.getStatus().name().replace("_", " ") : "PENDING";
        Paragraph statusPara = new Paragraph("Status: " + statusText)
                .setFontSize(11)
                .setBold()
                .setFontColor(getStatusColor(req.getStatus()));
        document.add(statusPara);
        document.add(new Paragraph("\n").setFontSize(4));

        // Main Details Table
        addSectionTitle(document, "Request Information");
        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{35, 65})).useAllAvailableWidth();
        addDetailRow(detailsTable, "Category", req.getCategory());
        addDetailRow(detailsTable, "Description", req.getDescription());
        addDetailRow(detailsTable, "Location", req.getLocation());
        addDetailRow(detailsTable, "Required Service Date",
                req.getRequiredServiceDate() != null ? req.getRequiredServiceDate().format(df) : "—");
        addDetailRow(detailsTable, "Submitted Date",
                req.getCreatedDate() != null ? req.getCreatedDate().format(dtf) : "—");
        addDetailRow(detailsTable, "Last Updated",
                req.getUpdatedDate() != null ? req.getUpdatedDate().format(dtf) : "—");
        document.add(detailsTable);
        document.add(new Paragraph("\n").setFontSize(6));

        // Citizen Details
        addSectionTitle(document, "Citizen Details");
        Table citizenTable = new Table(UnitValue.createPercentArray(new float[]{35, 65})).useAllAvailableWidth();
        addDetailRow(citizenTable, "Full Name", req.getCitizenName());
        addDetailRow(citizenTable, "Email Address", req.getCitizenEmail());
        addDetailRow(citizenTable, "Phone Number", req.getPhoneNumber());
        document.add(citizenTable);
        document.add(new Paragraph("\n").setFontSize(6));

        // Admin Section (only if admin)
        if (isAdmin) {
            addSectionTitle(document, "Administration Details");
            Table adminTable = new Table(UnitValue.createPercentArray(new float[]{35, 65})).useAllAvailableWidth();
            addDetailRow(adminTable, "Assigned Officer",
                    req.getAssignedOfficer() != null && !req.getAssignedOfficer().isBlank() ? req.getAssignedOfficer() : "Not assigned");
            addDetailRow(adminTable, "Admin Notes",
                    req.getAdminNotes() != null && !req.getAdminNotes().isBlank() ? req.getAdminNotes() : "No notes added");
            document.add(adminTable);
            document.add(new Paragraph("\n").setFontSize(6));
        }

        addFooter(document, dtf);
        document.close();
        return baos.toByteArray();
    }

    private byte[] generateAdminReportPdf(List<ServiceRequest> requests, RequestStatus status, String category, String search) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4.rotate()); // Landscape for table
        document.setMargins(35, 40, 35, 40);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd MMM yyyy");

        addHeader(document, "Service Requests Report");

        // Filter info line
        StringBuilder filterInfo = new StringBuilder("Filters Applied: ");
        filterInfo.append(status != null ? "Status = " + status.name() : "All Statuses");
        filterInfo.append(category != null && !category.isBlank() ? " | Category = " + category : "");
        filterInfo.append(search != null && !search.isBlank() ? " | Search = \"" + search + "\"" : "");
        filterInfo.append(" | Total Records: ").append(requests.size());

        document.add(new Paragraph(filterInfo.toString())
                .setFontSize(9)
                .setFontColor(new DeviceRgb(100, 116, 139))
                .setMarginBottom(10));

        if (requests.isEmpty()) {
            document.add(new Paragraph("No service requests found matching the specified filters.")
                    .setFontSize(11)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(100, 116, 139))
                    .setMarginTop(40));
        } else {
            // Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{10, 14, 14, 14, 11, 10, 12, 15}))
                    .useAllAvailableWidth();

            // Header row
            String[] headers = {"Request ID", "Citizen Name", "Email", "Category", "Status", "Req. Date", "Officer", "Admin Notes"};
            for (String h : headers) {
                Cell headerCell = new Cell()
                        .add(new Paragraph(h).setBold().setFontSize(8).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(TABLE_HEADER_BG)
                        .setPadding(6)
                        .setBorder(Border.NO_BORDER);
                table.addHeaderCell(headerCell);
            }

            // Data rows
            boolean alt = false;
            for (ServiceRequest req : requests) {
                Color rowBg = alt ? new DeviceRgb(248, 250, 252) : ColorConstants.WHITE;
                addTableCell(table, req.getRequestId(), rowBg, true);
                addTableCell(table, req.getCitizenName(), rowBg, false);
                addTableCell(table, req.getCitizenEmail(), rowBg, false);
                addTableCell(table, req.getCategory(), rowBg, false);
                addTableCell(table, req.getStatus() != null ? req.getStatus().name().replace("_", " ") : "—", rowBg, false);
                addTableCell(table, req.getRequiredServiceDate() != null ? req.getRequiredServiceDate().format(df) : "—", rowBg, false);
                addTableCell(table, req.getAssignedOfficer() != null ? req.getAssignedOfficer() : "—", rowBg, false);
                addTableCell(table, req.getAdminNotes() != null ? req.getAdminNotes() : "—", rowBg, false);
                alt = !alt;
            }
            document.add(table);
        }

        addFooter(document, dtf);
        document.close();
        return baos.toByteArray();
    }

    // ======== Layout Helpers ========

    private void addHeader(Document document, String title) {
        // Top blue banner
        Table banner = new Table(UnitValue.createPercentArray(new float[]{1})).useAllAvailableWidth();
        Cell bannerCell = new Cell()
                .add(new Paragraph("Citizen Care — Service Request Portal")
                        .setFontSize(9)
                        .setFontColor(new DeviceRgb(187, 219, 254))
                        .setMarginBottom(2))
                .add(new Paragraph(title)
                        .setFontSize(20)
                        .setBold()
                        .setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(NAVY_DARK)
                .setPadding(20)
                .setBorder(Border.NO_BORDER);
        banner.addCell(bannerCell);
        document.add(banner);
        document.add(new Paragraph("\n").setFontSize(8));
    }

    private void addSectionTitle(Document document, String title) {
        document.add(new Paragraph(title)
                .setFontSize(12)
                .setBold()
                .setFontColor(NAVY_DARK)
                .setBorderBottom(new SolidBorder(BRAND_BLUE, 2))
                .setMarginBottom(6)
                .setMarginTop(4));
    }

    private void addDetailRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFontSize(9).setBold().setFontColor(new DeviceRgb(100, 116, 139)))
                .setBackgroundColor(LIGHT_BG)
                .setPadding(8)
                .setBorderBottom(new SolidBorder(BORDER_COLOR, 0.5f))
                .setBorderRight(new SolidBorder(BORDER_COLOR, 0.5f));

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null ? value : "—").setFontSize(9).setFontColor(NAVY_DARK))
                .setPadding(8)
                .setBorderBottom(new SolidBorder(BORDER_COLOR, 0.5f));

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addTableCell(Table table, String value, Color bg, boolean bold) {
        Paragraph p = new Paragraph(value != null ? value : "—").setFontSize(8);
        if (bold) p.setBold().setFontColor(BRAND_BLUE);
        Cell cell = new Cell()
                .add(p)
                .setBackgroundColor(bg)
                .setPadding(5)
                .setBorder(new SolidBorder(BORDER_COLOR, 0.3f));
        table.addCell(cell);
    }

    private void addFooter(Document document, DateTimeFormatter dtf) {
        document.add(new Paragraph("\n").setFontSize(6));
        document.add(new Paragraph(
                "Generated on: " + LocalDateTime.now().format(dtf) + "  |  Citizen Care — Service Request Portal  |  CONFIDENTIAL")
                .setFontSize(8)
                .setFontColor(new DeviceRgb(148, 163, 184))
                .setTextAlignment(TextAlignment.CENTER)
                .setBorderTop(new SolidBorder(BORDER_COLOR, 0.5f))
                .setPaddingTop(8));
    }

    private DeviceRgb getStatusColor(RequestStatus status) {
        if (status == null) return new DeviceRgb(100, 116, 139);
        return switch (status) {
            case PENDING -> new DeviceRgb(180, 83, 9);
            case IN_PROGRESS -> new DeviceRgb(67, 56, 202);
            case COMPLETED -> new DeviceRgb(21, 128, 61);
            case REJECTED -> new DeviceRgb(185, 28, 28);
        };
    }
}
