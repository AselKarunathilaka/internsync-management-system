FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the parent pom
COPY pom.xml .

# Copy the module poms
COPY proxy-core/pom.xml proxy-core/
COPY backend/pom.xml backend/

# Go offline to download dependencies
RUN mvn -B -DskipTests dependency:go-offline

# Copy the source code
COPY proxy-core/src proxy-core/src
COPY backend/src backend/src

# Build the backend module (and its local dependencies like proxy-core)
RUN mvn -B clean package -DskipTests -pl backend -am

FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar from the backend target directory
COPY --from=build /app/backend/target/*.jar app.jar

EXPOSE 19090

CMD ["sh", "-c", "java ${JAVA_OPTS:-} -jar app.jar"]
