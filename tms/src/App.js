// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute'; 

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage'; 
import TaskFormPage from './pages/TaskFormPage'; 
import NotFoundPage from './pages/NotFoundPage';

import './App.css'; 

function App() {
  return (
    <AuthProvider> 
      <Router> 
        <Navbar /> 
        <div className="container"> 
          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} /> 

           <Route
              path="/" 
              element={
                <PrivateRoute>
                  <HomePage /> 
                </PrivateRoute>
              }
            />
             <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <TaskListPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/tasks/:id" 
              element={
                <PrivateRoute>
                  <TaskDetailPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/create-task" 
              element={
                <PrivateRoute>
                  <TaskFormPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/edit-task/:id" 
              element={
                <PrivateRoute>
                  <TaskFormPage isEditing={true} /> 
                </PrivateRoute>
              }
            />


            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;