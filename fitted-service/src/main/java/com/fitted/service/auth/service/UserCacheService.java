package com.fitted.service.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserCacheService {

    @Caching(evict = {
            @CacheEvict(value = "users", key = "#userId.toString()"),
            @CacheEvict(value = "userDetails", key = "#email"),
    })
    public void evictUserCache(UUID userId, String email) {
        log.debug("Evicting cache for user ID: {} and email: {}", userId, email);
    }

    @Caching(evict = {
            @CacheEvict(value = "users", allEntries = true),
            @CacheEvict(value = "userDetails", allEntries = true)
    })
    public void evictAllUserCaches() {
        log.info("Evicting all user caches");
    }
}