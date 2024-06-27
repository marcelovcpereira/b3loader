# Certs
FROM alpine:latest as certs
RUN apk --update add ca-certificates

# Build
FROM golang:1.22.4 as builder
WORKDIR /app
COPY . .
RUN make build-loader

# Final
FROM scratch
COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /app/build/b3loader /

EXPOSE 8080
ENTRYPOINT ["./b3loader"]
