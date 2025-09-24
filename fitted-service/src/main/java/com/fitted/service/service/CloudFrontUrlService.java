package com.fitted.service.service;

import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class CloudFrontUrlService {

    @Getter
    @Value("${cloudfront.domain}")
    private String cloudFrontDomain;

    @Getter
    @Value("${cloudfront.enabled}")
    private boolean cloudFrontEnabled;

    @Value("${aws.s3.bucket-name}")
    private String s3BucketName;

    public String convertS3ToCloudFrontUrl(String s3Url) {
        if (!cloudFrontEnabled || s3Url == null || !s3Url.startsWith("s3://")) {
            log.debug("CloudFront disabled or invalid S3 URL, returning original: {}", s3Url);
            return s3Url;
        }

        try {
            String s3Prefix = "s3://" + s3BucketName + "/";

            if (s3Url.startsWith(s3Prefix)) {
                String key = s3Url.substring(s3Prefix.length());

                return "https://" + cloudFrontDomain + "/" + key;
            } else {
                log.warn("S3 URL does not match expected bucket: {}", s3Url);
                return s3Url;
            }
        } catch (Exception e) {
            log.error("Error converting S3 URL to CloudFront URL: {}", s3Url, e);
            return s3Url;
        }
    }

    public String convertCloudFrontToS3Url(String cloudFrontUrl) {
        if (!cloudFrontEnabled || cloudFrontUrl == null) {
            return cloudFrontUrl;
        }

        try {
            String cloudFrontPrefix = "https://" + cloudFrontDomain + "/";

            if (cloudFrontUrl.startsWith(cloudFrontPrefix)) {
                String key = cloudFrontUrl.substring(cloudFrontPrefix.length());

                return "s3://" + s3BucketName + "/" + key;
            } else {
                log.debug("URL is not a CloudFront URL: {}", cloudFrontUrl);
                return cloudFrontUrl;
            }
        } catch (Exception e) {
            log.error("Error converting CloudFront URL to S3 URL: {}", cloudFrontUrl, e);
            return cloudFrontUrl;
        }
    }
}