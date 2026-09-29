package uz.akmal.distributor_app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import uz.akmal.distributor_app.service.ShopService;
import uz.akmal.distributor_app.service.ReportService;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@org.junit.jupiter.api.Disabled("Local unit test suite runs with Mockito without external PostgreSQL")
class DistributorAppApplicationTests {

    @Autowired
    private ShopService shopService;

    @Autowired
    private ReportService reportService;

    @Test
    @org.junit.jupiter.api.Disabled("Local unit test suite runs with Mockito without external PostgreSQL")
    void contextLoads() {
        assertNotNull(shopService);
        assertNotNull(reportService);
    }
}
