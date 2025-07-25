package com.fitted.service.config;

import com.fitted.service.properties.AWSProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@ConfigurationProperties
@EnableConfigurationProperties(AWSProperties.class)
public class AWSConfig {

    @Bean
    public S3Client s3Client(AWSProperties awsProperties) {
        return S3Client.builder()
                .region(Region.of(awsProperties.getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.builder().asyncCredentialUpdateEnabled(true).build())
                .build();
    }
}
