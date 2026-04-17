# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["backend/src/BillSplitter.Api/BillSplitter.Api.csproj", "backend/src/BillSplitter.Api/"]
COPY ["backend/src/BillSplitter.Infrastructure/BillSplitter.Infrastructure.csproj", "backend/src/BillSplitter.Infrastructure/"]
COPY ["backend/src/BillSplitter.Application/BillSplitter.Application.csproj", "backend/src/BillSplitter.Application/"]
COPY ["backend/src/BillSplitter.Domain/BillSplitter.Domain.csproj", "backend/src/BillSplitter.Domain/"]

RUN dotnet restore "backend/src/BillSplitter.Api/BillSplitter.Api.csproj"

# Copy everything from backend and build
COPY backend/ .
WORKDIR "/src/src/BillSplitter.Api"
RUN dotnet build "BillSplitter.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "BillSplitter.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Use the built-in .NET 'app' user for security
USER app

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BillSplitter.Api.dll"]
