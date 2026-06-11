package com.example.deploymentlab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.deploymentlab", "com.example.proxy"})
@EnableMongoRepositories(basePackages = {"com.example.deploymentlab.repository", "com.example.proxy.repository"})
public class DeploymentLabApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeploymentLabApplication.class, args);
	}
}
