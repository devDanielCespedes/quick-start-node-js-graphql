#!/bin/bash

pnpm prisma generate
pnpm prisma db push
pnpm dev