package com.citizen.service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class CitizenServiceApplication {

    public static void main(String[] args) {
        // Load .env file if available from backend directory or current directory
        try {
            String dir = new File("backend/.env").exists() ? "./backend" : "./";
            Dotenv dotenv = Dotenv.configure()
                    .directory(dir)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception ignored) {
            // Environment variables will be read from system environment or application.properties
        }

        SpringApplication.run(CitizenServiceApplication.class, args);
    }
}
