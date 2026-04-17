# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["src/BillSplitter.Api/BillSplitter.Api.csproj", "src/BillSplitter.Api/"]
COPY ["src/BillSplitter.Infrastructure/BillSplitter.Infrastructure.csproj", "src/BillSplitter.Infrastructure/"]
COPY ["src/BillSplitter.Application/BillSplitter.Application.csproj", "src/BillSplitter.Application/"]
COPY ["src/BillSplitter.Domain/BillSplitter.Domain.csproj", "src/BillSplitter.Domain/"]

RUN dotnet restore "src/BillSplitter.Api/BillSplitter.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/src/BillSplitter.Api"
RUN dotnet build "BillSplitter.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "BillSplitter.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Environment variables
ENV ASPNETCORE_URLS=http://+:5070
EXPOSE 5070

ENTRYPOINT ["dotnet", "BillSplitter.Api.dll"]
