export function useToast() {
  const toast = (props: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    // No-op placeholder for now. Real implementation will be added in Task 11+
    console.log("Toast:", props)
  }

  return { toast }
}
