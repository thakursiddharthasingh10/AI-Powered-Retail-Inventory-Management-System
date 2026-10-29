# Troubleshooting & Operational Runbook

**Project:** Enterprise Retail Management, Inventory Control & AI-Powered Business Intelligence System  
**Version:** 1.0.0

This runbook details common operational issues, diagnostics, and step-by-step remediations.

---

## 1. Port Conflicts

### Symptom: `java.net.BindException: Address already in use: 8080`
**Cause:** Another process is holding port 8080 (e.g., Tomcat, Jenkins, or an orphaned backend instance).
**Resolution:**
```bash
# Locate the process ID
lsof -i :8080
# Terminate the lingering process
kill -9 <PID>

# Alternatively, override backend port via environment variable:
PORT=8081 mvn spring-boot:run
```

### Symptom: `Error: listen EADDRINUSE: address already in use :::5173`
**Resolution:**
Vite automatically attempts the next open port (e.g. 5174). If you wish to force 5173:
```bash
lsof -i :5173 | awk 'NR>1 {print $2}' | xargs kill -9
```

---

## 2. Database Connection Issues

### Symptom: `Communications link failure / Connection refused: /tmp/mysql.sock or localhost:3306`
**Cause:** MySQL server is stopped or local socket is inactive.
**Remedy:**
1. **Zero-Dependency Quick-Fix:** The backend is configured to use the in-memory H2 MySQL compatibility profile (`h2`) by default if MySQL is inactive. Ensure `spring.profiles.active=h2` in `application.yml` or run:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=h2
   ```
2. **If running MySQL locally:**
   ```bash
   # macOS (Homebrew)
   brew services start mysql
   # Ubuntu / Debian Linux
   sudo systemctl start mysql
   ```

### Symptom: `Access denied for user 'retail_user'@'localhost'`
**Remedy:**
Verify database permissions:
```sql
CREATE DATABASE IF NOT EXISTS retail_db;
CREATE USER IF NOT EXISTS 'retail_user'@'%' IDENTIFIED BY 'retail_pass';
GRANT ALL PRIVILEGES ON retail_db.* TO 'retail_user'@'%';
FLUSH PRIVILEGES;
```

---

## 3. JDK 21 Mockito Agent Attachment Warning

### Symptom: `Java 21 JEP 451: Could not initialize inline Byte Buddy mock maker`
**Cause:** Java 21 enforces security restrictions on runtime dynamic bytecode agent attachment.
**Remedy:**
The project configuration in `backend/pom.xml` already includes:
```xml
<argLine>-XX:+EnableDynamicAgentLoading -Dnet.bytebuddy.experimental=true</argLine>
```
Additionally, `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` specifies `mock-maker-subclass` to guarantee reliable non-inline mocking under JDK 21 without JVM warnings.

---

## 4. AI Forecasting Microservice Degradation

### Symptom: AI Microservice is offline or Python runtime missing
**Observation:**
The Java backend logs:
```
WARN c.r.m.service.AiService : External AI service unreachable. Falling back to internal statistical model.
```
**Remedy:**
- **No manual intervention required!** The application implements a graceful circuit-breaker fallback.
- Forecasts and reorder recommendations will continue to be computed in real time using the backend's internal statistical formulas ($SS = Z \times \sigma_d \times \sqrt{L}$).
- To start the Python microservice:
  ```bash
  cd ai-service
  python3 -m uvicorn app.main:app --port 8000
  ```

---

## 5. Authentication & Token Invalidation

### Symptom: Frontend redirects to `/login` or displays HTTP 401 Unauthorized
**Cause:** JWT token has expired (default lifetime is 24 hours) or user changed their password.
**Remedy:**
1. Log in again via the login interface.
2. If testing in Postman, re-execute `1. Authentication & Security -> Admin Login`. The test script will automatically update the `{{jwt_token}}` environment variable.

---

## 6. Frontend Build / Dependency Issues

### Symptom: `npm run build` fails or missing packages
**Remedy:**
```bash
cd frontend
# Clear npm cache and re-install
rm -rf node_modules package-lock.json
npm install
npm run build
```
