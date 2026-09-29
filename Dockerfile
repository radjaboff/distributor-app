# 1-bosqich: Loyihani yig'ish (Maven Build)
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B || true

COPY src ./src
RUN ./mvnw clean package -DskipTests

# 2-bosqich: Yengil ishchi muhit (JRE Runtime)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# O'zbekiston Toshkent vaqt mintaqasi va healthcheck uchun curl
RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Asia/Tashkent /etc/localtime && \
    echo "Asia/Tashkent" > /etc/timezone

COPY --from=builder /build/target/distributor-app-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:8080/login.html || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
