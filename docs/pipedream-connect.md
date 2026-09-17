# Pipedream Connect — OrgSuite

**Status:** Ready to Configure (development)
**Project:** `proj_qzsEmM9`
**Environment:** `development`
**Code:** `pipedream-connect/`
**OAuth client:** Requires Authorization
**Live session:** Not Connected

## Purpose

Give OrgSuite users managed auth to 3,000+ APIs through Pipedream Connect, without OrgSuite storing third-party refresh tokens.

## API

- Base: `https://api.pipedream.com/v1/connect/proj_qzsEmM9`
- Auth: Pipedream workspace OAuth client (`client_credentials`)
- User mapping: OrgSuite user id → Connect `external_user_id`
- Header / SDK field: `projectEnvironment: "development"`

Official docs: https://pipedream.com/docs/connect/quickstart
