package com.fitted.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FittedServiceApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(FittedServiceApplication.class);

		String profile = System.getenv("SPRING_PROFILES_ACTIVE");
		if (profile == null || profile.isEmpty()) {
			app.setAdditionalProfiles("local");
		}

		app.run(args);
	}

}
