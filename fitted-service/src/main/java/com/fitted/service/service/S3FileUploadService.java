package com.fitted.service.service;

import com.fitted.service.exception.s3.S3FileUploadServerException;
import com.fitted.service.exception.s3.S3FileUploadValidationException;
import com.fitted.service.properties.AWSProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Log4j2
@Service
@RequiredArgsConstructor
public class S3FileUploadService {
    private final static long MAX_FILE_SIZE = (long) (2 * Math.pow(1024, 3));

    private final S3Client s3Client;
    private final AWSProperties awsProperties;

    public String uploadImageFileSimple(MultipartFile imageFile, String keyFileName) {
        validateImageFileSize(imageFile);

        try {
            String bucketName = awsProperties.getS3().getBucketName();

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyFileName)
                    .contentType(imageFile.getContentType())
                    .build();
            s3Client.putObject(request,
                    RequestBody.fromInputStream(imageFile.getInputStream(), imageFile.getSize()));

            return String.format("s3://%s/%s", bucketName, keyFileName);
        } catch (Exception e) {
            log.error("S3 put object failed", e);
            throw new S3FileUploadServerException(e.getMessage(), e);
        }
    }

    public String uploadImageFileMultipart(MultipartFile imageFile, String keyFileName) {
        validateImageFileSize(imageFile);

        String bucketName = awsProperties.getS3().getBucketName();
        String uploadId = null;

        try {
            log.info("Creating multi part upload to S3.");
            CreateMultipartUploadRequest createMultipartUploadRequest = CreateMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(keyFileName)
                    .contentType(imageFile.getContentType())
                    .build();

            CreateMultipartUploadResponse createMultipartUploadResponse = s3Client.createMultipartUpload(createMultipartUploadRequest);
            uploadId = createMultipartUploadResponse.uploadId();
            try (InputStream inputStream = imageFile.getInputStream()) {
                int BUFFER_SIZE = (50 * 1024 * 1024), partId = 1, bytesRead;
                byte[] buffer = new byte[BUFFER_SIZE];
                List<CompletedPart> completedParts = new ArrayList<>();

                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    byte[] partData = Arrays.copyOf(buffer, bytesRead);
                    UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                            .bucket(bucketName)
                            .key(keyFileName)
                            .uploadId(uploadId)
                            .partNumber(partId)
                            .build();
                    UploadPartResponse uploadPartResponse = s3Client.uploadPart(uploadPartRequest,
                            RequestBody.fromBytes(partData));
                    completedParts.add(CompletedPart.builder()
                            .partNumber(partId)
                            .eTag(uploadPartResponse.eTag())
                            .build());
                    partId++;
                }

                log.info("Completing multi part upload to S3.");
                CompleteMultipartUploadRequest completeMultipartUploadRequest = CompleteMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(keyFileName)
                        .uploadId(uploadId)
                        .multipartUpload(CompletedMultipartUpload.builder()
                                .parts(completedParts)
                                .build())
                        .build();
                CompleteMultipartUploadResponse completeMultipartUploadResponse = s3Client.completeMultipartUpload(completeMultipartUploadRequest);
                return String.format("s3://%s/%s", completeMultipartUploadResponse.bucket(), completeMultipartUploadResponse.key());
            } catch (IOException e) {
                log.error("IOException while performing multi part upload to S3", e);
                abortMultiPartUpload(bucketName, keyFileName, uploadId);
                throw new S3FileUploadServerException("IOException while performing multi part upload to S3", e);
            }
        } catch (Exception e) {
            if (Objects.nonNull(uploadId)) {
                abortMultiPartUpload(bucketName, keyFileName, uploadId);
            }
            throw new S3FileUploadServerException(e.getMessage(), e);
        }
    }

    private void abortMultiPartUpload(String bucketName, String key, String uploadId) {
        try {
            log.warn("Starting to abort multi part upload with id: {}", uploadId);
            AbortMultipartUploadRequest abortMultipartUploadRequest = AbortMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .uploadId(uploadId)
                    .build();
            s3Client.abortMultipartUpload(abortMultipartUploadRequest);
            log.warn("Aborting multi part upload completed for upload id: {}", uploadId);
        } catch (Exception e) {
            log.error("Aborting multi part S3 upload", e);
            throw new S3FileUploadServerException(e.getMessage(), e);
        }
    }

    private void validateImageFileSize(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new S3FileUploadValidationException("Input image file is missing but required.");
        }

        if (imageFile.getSize() > MAX_FILE_SIZE) {
            throw new S3FileUploadValidationException("Input image size is larger than supported size of 2 GB.");
        }
    }
}
