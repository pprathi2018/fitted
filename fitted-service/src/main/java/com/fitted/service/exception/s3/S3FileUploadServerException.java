package com.fitted.service.exception.s3;

public class S3FileUploadServerException extends RuntimeException {
    public S3FileUploadServerException(String message) {
        super(message);
    }

    public S3FileUploadServerException(String message, Throwable cause) {
        super(message, cause);
    }
}
