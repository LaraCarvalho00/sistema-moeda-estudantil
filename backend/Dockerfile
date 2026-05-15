FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache wget
WORKDIR /app
COPY --from=build /build/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=8s --timeout=4s --start-period=55s --retries=8 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/api/v1/instituicoes || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
