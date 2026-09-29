package uz.akmal.distributor_app;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
public class DistributorAppApplication {

	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Tashkent"));
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.data.domain.AuditorAware<String> auditorAware() {
		return () -> java.util.Optional.of(uz.akmal.distributor_app.util.SecurityUtils.getCurrentUsername());
	}

	public static void main(String[] args) {
		SpringApplication.run(DistributorAppApplication.class, args);
	}

}

