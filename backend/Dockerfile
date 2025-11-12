FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod tidy
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /main .
COPY tasks.json .
EXPOSE 8080
CMD ["/app/main"]