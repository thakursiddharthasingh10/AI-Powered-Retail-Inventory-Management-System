# Abstract & Table of Contents

---

## ABSTRACT

In contemporary omnichannel retail supply chains, conventional standalone inventory systems and rudimentary point-of-sale (POS) software frequently suffer from data silos, inventory drift, concurrency anomalies (overselling), human error in replenishment forecasting, and vulnerability to security exploits. Retail enterprises face severe working capital loss through either holding excess dormant stock (overstocking) or suffering missed sales and brand erosion (stockouts).

To resolve these systemic inefficiencies, this major engineering project presents the **Enterprise Retail Management, Inventory Control & AI-Powered Business Intelligence System**, an enterprise full-stack distributed web platform engineered in compliance with industry ERP standards.

The application architecture features:
1. **Presentation Tier:** A responsive Single Page Application (SPA) developed in **React 18** and **Vite**, offering 22 views, real-time Recharts analytics, role-guarded routes, and barcode-enabled POS billing.
2. **Enterprise Service Tier:** A robust RESTful backend engineered in **Java 21** with **Spring Boot 3.3.4**, implementing stateless **JSON Web Token (JWT)** security, **Role-Based Access Control (RBAC)** across four organizational roles (*ADMIN, MANAGER, INVENTORY_STAFF, CASHIER*), transactional integrity via Spring Data JPA and Hibernate 6.5, and automated audit logging.
3. **Database Tier:** A normalized **MySQL 8.0** relational schema comprising **26 tables**, enforcing ACID guarantees, double-entry stock movement ledgers, and optimistic concurrency locking.
4. **AI & Predictive Intelligence Tier:** A decoupled **Python 3 FastAPI** machine learning microservice providing time-series demand forecasting (using linear regression and moving averages evaluated with strict chronological train/test splits), deterministic operations research safety-stock replenishment formulas ($SS = Z \times \sigma_d \times \sqrt{L}$), and a natural language retail copilot grounded in real database figures.
5. **Fault-Tolerant Resiliency:** The system incorporates an autonomous statistical fallback inside the Java service layer, guaranteeing uninterrupted operations even during AI service downtime.

Rigorous automated testing with JUnit 5, Mockito, Python unittest, and Vite build pipelines demonstrates **100% test pass rates across 18 automated suites**. The platform provides complete transparency, traceability, and computational performance suitable for high-volume enterprise retail environments.

**Keywords:** Enterprise Retail Management, Inventory Control, Double-Entry Stock Ledger, Demand Forecasting, Operations Research, Safety Stock, Spring Boot, React, FastAPI, Role-Based Access Control (RBAC).

---

## TABLE OF CONTENTS

- **Chapter 1: Introduction**
  - 1.1 Background & Motivation
  - 1.2 Problem Statement
  - 1.3 Project Objectives
  - 1.4 Scope of the System
  - 1.5 Organization of the Thesis
- **Chapter 2: Literature Survey & Comparative Analysis**
  - 2.1 Evolution of Retail & Inventory Management Systems
  - 2.2 Survey of Existing Solutions & Commercial ERPs
  - 2.3 Limitations of Contemporary Software
  - 2.4 Research Gaps & Proposed Contributions
  - 2.5 Comparative Analysis Table
- **Chapter 3: Software Requirements Specification (SRS)**
  - 3.1 Functional Requirements (Modules A – H)
  - 3.2 Non-Functional Requirements (Performance, Security, Reliability)
  - 3.3 Hardware, Software, and Network Prerequisites
  - 3.4 Feasibility Study (Technical, Economic, Operational)
- **Chapter 4: System Architecture & UML Design**
  - 4.1 High-Level Multi-Tier Architecture
  - 4.2 Use Case Modeling & Actor Roles
  - 4.3 Sequence Diagrams (POS Sale & Stock Transfer)
  - 4.4 Activity Diagrams (Procurement & Receiving Workflow)
  - 4.5 Class Diagram & Entity Relationships
  - 4.6 Relational Schema ERD (26 Tables)
- **Chapter 5: Implementation Details & Software Engineering**
  - 5.1 Backend Development (Java 21, Spring Boot 3.3.4, JPA)
  - 5.2 Security Layer (Stateless JWT, BCrypt, RBAC Filters)
  - 5.3 Double-Entry Stock Movement Ledger Implementation
  - 5.4 Concurrency Control & Overselling Prevention
  - 5.5 Frontend Client Engineering (React 18, Vite, Context)
- **Chapter 6: AI-Powered Demand Forecasting & Replenishment Intelligence**
  - 6.1 Machine Learning Demand Forecasting Formulation
  - 6.2 Data Leakage Prevention & Chronological Evaluation
  - 6.3 Operations Research Safety Stock & Reorder Point Formulation
  - 6.4 Grounded Natural Language Retail Copilot (SQL RAG)
  - 6.5 Graceful Circuit-Breaker Fallback Architecture
- **Chapter 7: Quality Assurance, Verification & Testing**
  - 7.1 Test Strategy & Methodology
  - 7.2 Backend Unit & Integration Tests (JUnit 5, Mockito)
  - 7.3 AI Microservice Model Evaluation
  - 7.4 Frontend Production Bundle Validation
  - 7.5 Test Execution Matrix & Traceability
- **Chapter 8: Results, Experimental Analysis & Discussion**
  - 8.1 System Walkthrough & User Interfaces
  - 8.2 Computational Benchmarks & Response Latency
  - 8.3 Business Impact & Stockout Reduction Analysis
- **Chapter 9: Conclusion & Future Scope**
  - 9.1 Summary of Contributions
  - 9.2 Limitations of Present Work
  - 9.3 Roadmap for Future Enhancements
- **Appendices**
  - Appendix A: Complete REST API Endpoint Inventory
  - Appendix B: System Operator & User Manual
  - Appendix C: Comprehensive B.Tech Viva Voce Examination Guide
