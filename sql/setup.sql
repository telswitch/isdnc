-- ============================================================
-- DNC Checker - Database Setup Script
-- Target: Microsoft SQL Server 2019
--
-- Run this script against your target database BEFORE starting
-- the application for the first time.
--
-- Usage:
--   sqlcmd -S <server> -d <database> -U <user> -P <pass> -i setup.sql
-- ============================================================

USE [DNC];
GO

-- ============================================================
-- Table: [dbo].[users]
-- Stores application user accounts.
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables
    WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE [dbo].[users] (
        [id]            INT            IDENTITY(1,1) NOT NULL,
        [username]      NVARCHAR(100)  NOT NULL,
        [email]         NVARCHAR(255)  NOT NULL,
        [password_hash] NVARCHAR(255)  NOT NULL,
        [created_at]    DATETIME2(7)   NOT NULL CONSTRAINT [DF_users_created_at] DEFAULT GETUTCDATE(),
        [is_active]     BIT            NOT NULL CONSTRAINT [DF_users_is_active]   DEFAULT 1,

        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC)
    );

    PRINT 'Created table [dbo].[users]';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[users] already exists — skipping creation.';
END
GO

-- ============================================================
-- Unique index on username (also speeds up login queries)
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_users_username' AND object_id = OBJECT_ID('[dbo].[users]')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_users_username]
        ON [dbo].[users] ([username] ASC);
    PRINT 'Created index UX_users_username';
END
GO

-- ============================================================
-- Unique index on email
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_users_email' AND object_id = OBJECT_ID('[dbo].[users]')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_users_email]
        ON [dbo].[users] ([email] ASC);
    PRINT 'Created index UX_users_email';
END
GO

-- ============================================================
-- Stored Procedure: [dbo].[sp_dnc_lookup]
--
-- Parameters:
--   @PhoneNumber  NVARCHAR(20)  — 10-digit US phone number (digits only)
--   @LookupDate   DATE          — The date to check DNC registration against
--
-- Returns:
--   A result set with DNC lookup details.
--
-- TODO: Replace the stub SELECT with real DNC lookup logic.
-- ============================================================
CREATE OR ALTER PROCEDURE [dbo].[sp_dnc_lookup]
    @PhoneNumber  NVARCHAR(20),
    @LookupDate   DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- --------------------------------------------------------
    -- TODO: Implement real DNC lookup logic here.
    --       This stub returns a placeholder row so the
    --       application can be tested end-to-end.
    -- --------------------------------------------------------
    SELECT
        @PhoneNumber            AS [PhoneNumber],
        @LookupDate             AS [LookupDate],
        'STUB - Not Implemented' AS [Status],
        GETUTCDATE()            AS [CheckedAt],
        'Replace this stored procedure with real DNC query logic.' AS [Notes];
END
GO

PRINT 'Created/updated stored procedure [dbo].[sp_dnc_lookup]';
GO

-- ============================================================
-- Stored Procedure: [dbo].[sp_dnc_history]
--
-- Parameters:
--   @PhoneNumber  NVARCHAR(20)  — 10-digit US phone number (digits only)
--
-- Returns:
--   A result set with DNC registration history for the number.
--
-- TODO: Replace the stub SELECT with real DNC history logic.
-- ============================================================
CREATE OR ALTER PROCEDURE [dbo].[sp_dnc_history]
    @PhoneNumber  NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- --------------------------------------------------------
    -- TODO: Implement real DNC history logic here.
    --       This stub returns a placeholder row so the
    --       application can be tested end-to-end.
    -- --------------------------------------------------------
    SELECT
        @PhoneNumber            AS [PhoneNumber],
        GETUTCDATE()            AS [LookupDate],
        'STUB - Not Implemented' AS [Status],
        'Replace this stored procedure with real DNC history query logic.' AS [Notes];
END
GO

PRINT 'Created/updated stored procedure [dbo].[sp_dnc_history]';
GO

PRINT '';
PRINT '=== Setup complete ===';
PRINT 'Next steps:';
PRINT '  1. Copy .env.local.example to .env.local and fill in connection details';
PRINT '  2. Replace stub stored procedures with real DNC query logic';
PRINT '  3. Run: npm install && npm run dev';
