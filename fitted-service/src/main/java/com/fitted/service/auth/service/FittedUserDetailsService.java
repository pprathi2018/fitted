package com.fitted.service.auth.service;

import com.fitted.service.auth.model.UserPrincipal;
import com.fitted.service.auth.model.Users;
import com.fitted.service.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FittedUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Users> user = repository.findByEmailIgnoreCase(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException(String.format("User not found with email: %s", username));
        }
        return new UserPrincipal(user.get());
    }

    @Transactional
    public UserDetails loadUserById(UUID id) {
        Optional<Users> user = repository.findById(id);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException(String.format("User not found with id: %s", id.toString()));
        }
        return new UserPrincipal(user.get());
    }
}