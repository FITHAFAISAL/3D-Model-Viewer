import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted, #94a3b8)",
              fontSize: "0.85rem",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>⚠️</span>
            <span>Preview unavailable</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
