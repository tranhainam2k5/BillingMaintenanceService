# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY BE_Service/Api/BillingMaintenanceService.csproj ./BE_Service/Api/
RUN dotnet restore BE_Service/Api/BillingMaintenanceService.csproj

# Copy everything else and publish the application
COPY BE_Service/ ./BE_Service/
RUN dotnet publish BE_Service/Api/BillingMaintenanceService.csproj -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
COPY BE_Service/Fe /Fe

# Bind ASP.NET Core to port 80 (standard for Docker on Render)
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "BillingMaintenanceService.dll"]
