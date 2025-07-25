package com.fitted.service.exception.s3;

public class S3FileUploadValidationException extends RuntimeException {
    public S3FileUploadValidationException(String message) {
        super(message);
    }
}
