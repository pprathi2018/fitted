package com.fitted.service.utils;

import com.fitted.service.exception.ValidationException;
import lombok.extern.log4j.Log4j2;
import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Log4j2
public class FileUtils {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    public static MultipartFile validateFile(MultipartFile file) {
        if (Objects.isNull(file) || file.isEmpty()) {
            throw new ValidationException("File input is missing or empty.");
        }

        String contentType = file.getContentType();
        if (Objects.isNull(contentType) || !isValidFileType(file)) {
            throw new ValidationException(
                    String.format("Invalid file type: %s. Allowed types are: JPEG, PNG, WebP", contentType)
            );
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new ValidationException("File size exceeds maximum allowed size of 10MB");
        }

        return file;
    }

    public static String getClothingItemFileKey(String userId, String id, String imageType, String extension) {
        // userid/clothing-items/id/original.png
        return String.format("%s/clothing-items/%s/%s%s", userId, id, imageType, extension);
    }

    public static String getOutfitItemFileKey(String userId, String id, String extension) {
        // userid/outfits/id/outfit.png
        return String.format("%s/outfits/%s/outfit%s", userId, id, extension);
    }

    public static String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private static boolean isValidFileType(MultipartFile file) {
        try {
            Tika tika = new Tika();
            String detectedType = tika.detect(file.getInputStream());
            return ALLOWED_IMAGE_TYPES.contains(detectedType);
        } catch (IOException e) {
            log.error("Failed to detect file type", e);
            return false;
        }
    }
}
