import { useGlobalContext } from "./context/MainContext";

export function toggleDarkMode() {
  // Check if we're running in the browser

  if (typeof window === 'undefined') return;
  
  const htmlElement = document.documentElement; // Get the <html> element
  if (htmlElement.classList.contains('dark')) {
    htmlElement.classList.remove('dark'); // Disable dark mode
    window?.localStorage?.setItem('theme', 'light'); // Save preference
  } else {
    htmlElement.classList.add('dark'); // Enable dark mode
    window?.localStorage?.setItem('theme', 'dark'); // Save preference
  }
}

// Initialize theme based on saved preference
export function initializeTheme() {
  // You cannot use hooks outside of a React component
  // This will cause errors - see fix below
  const {night, setNight} = useGlobalContext()

  // Check if we're running in the browser
  if (typeof window === 'undefined') return;
  
  const savedTheme = window?.localStorage?.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    setNight(true);
  } else {
    document.documentElement.classList.remove('dark');
    setNight(false); 
  }
}

// New function to use within React components
export function useThemeInitializer() {
  const {night, setNight} = useGlobalContext();
  
  if (typeof window !== 'undefined') {
    const savedTheme = window?.localStorage?.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setNight(true);
    } else {
      document.documentElement.classList.remove('dark');
      setNight(false);
    }
  }
  
  return { night, setNight };
}
