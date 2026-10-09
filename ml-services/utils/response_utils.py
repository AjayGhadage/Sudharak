def format_response(success: bool, data=None, error=None):
    """Format standardized API response object."""
    return {
        "success": success,
        "data": data,
        "error": error
    }
