/**
 * Defines the structure for application branding configuration.
 * This allows for type-safe access to branding properties
 * throughout the application. The configuration itself is loaded
 * dynamically from the DOM.
 */
export interface BrandingConfig {
    appName: string;
    appAccent: string;
    fullAppName?: string;
}
