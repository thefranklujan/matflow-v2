#!/bin/bash
# MatFlow v2 Debug Script
# Run this to catch issues before starting the dev server

set -e
PROJECT_DIR="/Users/franklujan/Desktop/Claude Code/Elon/Crafted & Company/Crafted Systems/MatFlow v2"
cd "$PROJECT_DIR"

echo ""
echo "=========================================="
echo "  MatFlow v2 Debug Script"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# 1. Check node_modules exists
echo "[1/8] Checking node_modules..."
if [ ! -d "node_modules" ]; then
  echo "  ❌ node_modules missing. Running npm install..."
  npm install --legacy-peer-deps
else
  echo "  ✅ node_modules exists"
fi

# 2. Check required dependencies
echo "[2/8] Checking critical dependencies..."
DEPS=("expo" "expo-router" "react" "react-dom" "react-native" "react-native-reanimated" "react-native-gesture-handler" "react-native-screens" "react-native-safe-area-context" "nativewind" "babel-preset-expo" "react-native-worklets" "react-native-url-polyfill" "@supabase/supabase-js" "zustand" "@tanstack/react-query" "@react-native-community/netinfo" "lucide-react-native" "react-native-svg")

for dep in "${DEPS[@]}"; do
  if [ ! -d "node_modules/$dep" ]; then
    echo "  ❌ Missing: $dep"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ All ${#DEPS[@]} dependencies installed"
fi

# 3. Check .env
echo "[3/8] Checking environment variables..."
if [ ! -f ".env" ]; then
  echo "  ❌ .env file missing"
  ERRORS=$((ERRORS + 1))
else
  if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env && grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "  ✅ Supabase env vars present"
  else
    echo "  ❌ Missing Supabase env vars in .env"
    ERRORS=$((ERRORS + 1))
  fi
fi

# 4. Check babel config
echo "[4/8] Checking babel.config.js..."
if [ ! -f "babel.config.js" ]; then
  echo "  ❌ babel.config.js missing"
  ERRORS=$((ERRORS + 1))
else
  if grep -q "babel-preset-expo" babel.config.js && grep -q "nativewind/babel" babel.config.js; then
    echo "  ✅ Babel config looks good"
  else
    echo "  ⚠️  Babel config may be misconfigured"
    WARNINGS=$((WARNINGS + 1))
  fi
  if grep -q "react-native-reanimated/plugin" babel.config.js; then
    echo "  ⚠️  reanimated/plugin in babel.config.js can cause type errors with NativeWind. Remove it."
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# 5. Check metro config
echo "[5/8] Checking metro.config.js..."
if [ ! -f "metro.config.js" ]; then
  echo "  ❌ metro.config.js missing"
  ERRORS=$((ERRORS + 1))
else
  if grep -q "withNativeWind" metro.config.js; then
    echo "  ✅ Metro config has NativeWind"
  else
    echo "  ⚠️  Metro config missing withNativeWind"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# 6. Check package.json entry point
echo "[6/8] Checking package.json entry point..."
if grep -q '"main": "expo-router/entry"' package.json; then
  echo "  ✅ Entry point set to expo-router/entry"
else
  echo "  ❌ package.json main should be 'expo-router/entry'"
  ERRORS=$((ERRORS + 1))
fi

# 7. TypeScript check
echo "[7/8] Running TypeScript check..."
TS_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
TS_ERRORS=$(echo "$TS_OUTPUT" | grep "error TS" | wc -l | tr -d ' ')
if [ "$TS_ERRORS" -eq 0 ]; then
  echo "  ✅ No TypeScript errors"
else
  echo "  ⚠️  $TS_ERRORS TypeScript errors found:"
  echo "$TS_OUTPUT" | grep "error TS" | head -10
  WARNINGS=$((WARNINGS + 1))
fi

# 8. Check for common import issues
echo "[8/8] Checking imports..."
BAD_IMPORTS=$(grep -r "react-native-url-polyfill/dist" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules || true)
if [ -n "$BAD_IMPORTS" ]; then
  echo "  ❌ Old polyfill import found (use 'react-native-url-polyfill/auto'):"
  echo "  $BAD_IMPORTS"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ No deprecated imports found"
fi

# Summary
echo ""
echo "=========================================="
echo "  Results: $ERRORS errors, $WARNINGS warnings"
echo "=========================================="

if [ $ERRORS -gt 0 ]; then
  echo "  Fix the errors above before running the dev server."
  exit 1
else
  echo "  ✅ Ready to run: npx expo start --clear"
  echo ""
fi
