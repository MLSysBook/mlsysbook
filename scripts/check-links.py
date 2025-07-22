#!/usr/bin/env python3
"""
Simple link checker using the reliable linkchecker package.
Much simpler and more reliable than custom Node.js solutions.
"""

import subprocess
import sys
import os
import argparse
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors gracefully."""
    print(f"🔍 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print(f"✅ {description} - OK")
            return True
        else:
            print(f"❌ {description} - FAILED")
            if result.stderr:
                print(f"Error: {result.stderr}")
            if result.stdout:
                print(f"Output: {result.stdout}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - TIMEOUT")
        return False
    except Exception as e:
        print(f"💥 {description} - ERROR: {e}")
        return False

def check_prerequisites():
    """Check if required tools are available."""
    print("🔧 Checking prerequisites...")
    
    # Check Python 3
    if not run_command("python3 --version", "Python 3 availability"):
        sys.exit(1)
    
    # Check linkchecker
    if not run_command("linkchecker --version", "linkchecker availability"):
        print("📦 Installing linkchecker...")
        if not run_command("pip3 install linkchecker", "linkchecker installation"):
            print("❌ Failed to install linkchecker. Please install manually:")
            print("   pip3 install linkchecker")
            sys.exit(1)

def start_server():
    """Start a local HTTP server."""
    print("🚀 Starting local server on port 8080...")
    try:
        # Check if server is already running
        result = subprocess.run("curl -s http://localhost:8080 > /dev/null", shell=True)
        if result.returncode == 0:
            print("✅ Server already running on port 8080")
            return None
        
        # Start new server
        server = subprocess.Popen(
            ["python3", "-m", "http.server", "8080"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        # Give server time to start
        import time
        time.sleep(3)
        
        # Verify server is running
        if subprocess.run("curl -s http://localhost:8080 > /dev/null", shell=True).returncode == 0:
            print("✅ Server started successfully")
            return server
        else:
            print("❌ Failed to start server")
            server.terminate()
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Server startup error: {e}")
        sys.exit(1)

def check_links(internal_only=False, verbose=False):
    """Check links using linkchecker."""
    base_url = "http://localhost:8080"
    
    # Find HTML files to check
    html_files = []
    for file_path in ["index.html"]:
        if os.path.exists(file_path):
            html_files.append(f"{base_url}/{file_path}")
    
    # Add subdirectory HTML files
    for subdir in ["book", "tinytorch", "labs", "kits"]:
        html_file = Path(subdir) / "index.html"
        if html_file.exists():
            html_files.append(f"{base_url}/{subdir}/index.html")
    
    if not html_files:
        print("❌ No HTML files found to check")
        return False, False
    
    internal_success = True
    external_success = True
    
    # Check internal links first
    for url in html_files:
        print(f"\n🔗 Checking internal links for {url}...")
        
        cmd_parts = [
            "linkchecker",
            "--no-warnings",
            "--output=text",
            url
        ]
        
        if verbose:
            print(f"Running: {' '.join(cmd_parts)}")
        
        try:
            result = subprocess.run(
                cmd_parts,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                print(f"✅ {url} - Internal links OK")
            else:
                print(f"❌ {url} - Found broken internal links")
                if result.stdout.strip():
                    print(result.stdout)
                if result.stderr.strip():
                    print("STDERR:", result.stderr)
                internal_success = False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {url} - Internal link check timed out")
            internal_success = False
        except Exception as e:
            print(f"💥 {url} - Internal link check error: {e}")
            internal_success = False
    
    # Check external links separately (non-blocking)
    if not internal_only:
        print(f"\n🌐 Checking external links (non-blocking)...")
        for url in html_files:
            cmd_parts = [
                "linkchecker",
                "--check-extern",
                "--timeout=10",
                "--threads=3",
                "--no-warnings",
                "--output=text",
                url
            ]
            
            if verbose:
                print(f"Running: {' '.join(cmd_parts)}")
            
            try:
                result = subprocess.run(
                    cmd_parts,
                    capture_output=True,
                    text=True,
                    timeout=60  # Shorter timeout for external
                )
                
                if result.returncode == 0:
                    print(f"✅ {url} - External links OK")
                else:
                    print(f"⚠️  {url} - Some external links may be broken (non-critical)")
                    if verbose and result.stdout.strip():
                        print(result.stdout)
                    external_success = False
                    
            except subprocess.TimeoutExpired:
                print(f"⏰ {url} - External link check timed out (non-critical)")
                external_success = False
            except Exception as e:
                print(f"⚠️  {url} - External link check error (non-critical): {e}")
                external_success = False
    
    return internal_success, external_success

def check_common_issues():
    """Check for common link problems."""
    print("\n🔎 Checking for common issues...")
    
    html_files = ["index.html"]
    for subdir in ["book", "tinytorch", "labs", "kits"]:
        html_file = Path(subdir) / "index.html"
        if html_file.exists():
            html_files.append(str(html_file))
    
    issues_found = False
    
    for file_path in html_files:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for doubled protocols
        if 'hhttps' in content or 'hhttp' in content:
            print(f"❌ {file_path}: Found doubled protocol (hhttps/hhttp)")
            issues_found = True
        
        # Check for localhost links
        if 'localhost' in content or '127.0.0.1' in content:
            print(f"❌ {file_path}: Found localhost links")
            issues_found = True
    
    if not issues_found:
        print("✅ No common issues found")
    
    return not issues_found

def main():
    parser = argparse.ArgumentParser(description="Check website links")
    parser.add_argument("--internal-only", action="store_true", 
                       help="Check only internal links (faster)")
    parser.add_argument("--verbose", action="store_true",
                       help="Verbose output")
    args = parser.parse_args()
    
    print("🔗 MLSysBook Link Checker (Python Edition)")
    print("=" * 45)
    
    if args.internal_only:
        print("ℹ️  Internal links only (faster mode)")
    
    try:
        # Check prerequisites
        check_prerequisites()
        
        # Start server
        server = start_server()
        
        try:
            # Check common issues
            common_ok = check_common_issues()
            
            # Check links
            internal_ok, external_ok = check_links(args.internal_only, args.verbose)
            
            # Final result
            if common_ok and internal_ok:
                if not external_ok and not args.internal_only:
                    print("\n⚠️  Some external links may be broken, but that's okay!")
                    print("Internal links are all working - safe to deploy.")
                else:
                    print("\n🎉 All link checks passed!")
                    print("Your website is ready for deployment.")
                sys.exit(0)
            else:
                print("\n❌ Critical internal link issues found!")
                print("Please fix internal links and common issues before deploying.")
                print("(External link issues are non-critical and won't block deployment)")
                sys.exit(1)
                
        finally:
            # Clean up server
            if server:
                print("\n🧹 Stopping server...")
                server.terminate()
                server.wait()
                
    except KeyboardInterrupt:
        print("\n👋 Link check interrupted by user")
        sys.exit(0)

if __name__ == "__main__":
    main() 