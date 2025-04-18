import { Component, ErrorInfo, PropsWithChildren } from "react"
import { Text } from "react-native"

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  state = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong.</Text>
    }

    return this.props.children
  }
}