module default {
  scalar type UserPermission extending enum<
    PERM_USER,
    PERM_ADMIN
  >;

  scalar type LightType extending enum<
    AMBIANT,
    POINT
  >;

  abstract type Object3D {
    required property x -> float64;
    required property y -> float64;
    required property z -> float64;
    required property yaw -> float64;
    required property pitch -> float64;
    required property roll -> float64;
  }

  type Device {
    required property name -> str;
    required property filePath -> str;
  }

  type Presentation {
    required property name -> str;
    link modelId -> Presentation;
  }

  type PresentationDevice extending Object3D {
    required link presentation -> Presentation;
    required link device -> Device;
  }

  type PresentationLight extending Object3D {
    required link presentation -> Presentation;
    required property lightType -> LightType;
  }

  type PresentationImage {
    required link presenttationId -> Presentation;
    required property path -> str;
  }

  type User {
    required property email -> str {
      constraint exclusive;
    }
    required property permissions -> array<UserPermission>;
  }
}
