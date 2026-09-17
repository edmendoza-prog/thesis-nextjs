-- Migration 0008: Consolidate Teachers and Students into Users Table

-- 1. Safely Drop the old tables
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;

