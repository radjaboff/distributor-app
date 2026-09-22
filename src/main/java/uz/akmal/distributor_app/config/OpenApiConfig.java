package uz.akmal.distributor_app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Bozor Distributor API")
                        .version("1.0")
                        .description("Bozor distributor boshqaruv tizimi uchun REST API — mahsulot, do'kon, sotuv, to'lov va hisobotlar."));
    }
}