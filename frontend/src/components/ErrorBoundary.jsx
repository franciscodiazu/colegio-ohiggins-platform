import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-boundary" role="alert">
          <div className="error-boundary__panel">
            <h2 className="error-boundary__title">Algo salio mal</h2>
            <p className="error-boundary__message">
              Ocurrio un error inesperado. Puedes intentar recargar la pagina o volver al inicio.
            </p>
            <div className="error-boundary__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={this.handleReset}
              >
                Reintentar
              </button>
              <button
                type="button"
                className="btn btn--cancel"
                onClick={() => window.location.href = '/'}
              >
                Volver al inicio
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="error-boundary__detail">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
