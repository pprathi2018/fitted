package com.fitted.service.auth.validator;

import org.passay.LengthRule;
import org.passay.PasswordData;
import org.passay.PasswordValidator;
import org.passay.Rule;
import org.passay.RuleResult;
import org.passay.WhitespaceRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FittedPasswordValidator {
    private final PasswordValidator validator;

    public FittedPasswordValidator() {
        List<Rule> rules = new ArrayList<>();
        rules.add(new LengthRule(8, 128));
        rules.add(new WhitespaceRule());
        this.validator = new org.passay.PasswordValidator(rules);
    }

    public void validate(String password) {
        RuleResult result = validator.validate(new PasswordData(password));

        if (!result.isValid()) {
            List<String> messages = validator.getMessages(result);
            throw new IllegalArgumentException("Password validation failed: " + String.join(", ", messages));
        }
    }

    public boolean isValidPassword(String password) {
        try {
            validate(password);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

}
