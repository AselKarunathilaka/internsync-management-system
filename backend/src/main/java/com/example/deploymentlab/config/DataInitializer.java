package com.example.deploymentlab.config;

import com.example.deploymentlab.model.Intern;
import com.example.deploymentlab.model.User;
import com.example.deploymentlab.repository.InternRepository;
import com.example.deploymentlab.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final InternRepository internRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(InternRepository internRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.internRepository = internRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@internsync.local");
            admin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default ADMIN user created.");
        }

        if (internRepository.count() == 0) {
            Intern intern1 = new Intern();
            intern1.setInternNumber("3642");
            intern1.setFullName("Asel Karunathilaka");
            intern1.setEmail("asel@example.com");
            intern1.setDepartment("DevOps");
            intern1.setSpecialization("Cloud");
            intern1.setUniversity("SLIIT");
            intern1.setPhoneNumber("0771234567");
            intern1.setStartDate(LocalDate.now());
            intern1.setStatus("ACTIVE");

            Intern intern2 = new Intern();
            intern2.setInternNumber("4001");
            intern2.setFullName("Test Intern One");
            intern2.setEmail("test1@example.com");
            intern2.setDepartment("Software Engineering");
            intern2.setSpecialization("FullStack");
            intern2.setUniversity("SLIIT");
            intern2.setPhoneNumber("0771111111");
            intern2.setStartDate(LocalDate.now());
            intern2.setStatus("ACTIVE");

            Intern intern3 = new Intern();
            intern3.setInternNumber("4002");
            intern3.setFullName("Test Intern Two");
            intern3.setEmail("test2@example.com");
            intern3.setDepartment("Networking");
            intern3.setSpecialization("CICD");
            intern3.setUniversity("SLIIT");
            intern3.setPhoneNumber("0772222222");
            intern3.setStartDate(LocalDate.now().minusMonths(6));
            intern3.setEndDate(LocalDate.now());
            intern3.setStatus("COMPLETED");

            internRepository.save(intern1);
            internRepository.save(intern2);
            internRepository.save(intern3);

            System.out.println("Inserted 3 sample interns into the database.");
        }
    }
}
