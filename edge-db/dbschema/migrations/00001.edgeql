CREATE MIGRATION m1ler3q2nkidc47znqs7a55rpf7be7ivxaysfkpjs6r54y3ose7qya
    ONTO initial
{
  CREATE SCALAR TYPE default::UserPermission EXTENDING enum<PERM_USER, PERM_ADMIN>;
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY permissions -> array<default::UserPermission>;
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE FUTURE nonrecursive_access_policies;
  CREATE TYPE default::Device {
      CREATE REQUIRED PROPERTY filePath -> std::str;
      CREATE REQUIRED PROPERTY name -> std::str;
  };
  CREATE ABSTRACT TYPE default::Object3D {
      CREATE REQUIRED PROPERTY pitch -> std::float64;
      CREATE REQUIRED PROPERTY roll -> std::float64;
      CREATE REQUIRED PROPERTY x -> std::float64;
      CREATE REQUIRED PROPERTY y -> std::float64;
      CREATE REQUIRED PROPERTY yaw -> std::float64;
      CREATE REQUIRED PROPERTY z -> std::float64;
  };
  CREATE TYPE default::Presentation {
      CREATE LINK modelId -> default::Presentation;
      CREATE REQUIRED PROPERTY name -> std::str;
  };
  CREATE TYPE default::PresentationDevice EXTENDING default::Object3D {
      CREATE REQUIRED LINK device -> default::Device;
      CREATE REQUIRED LINK presentation -> default::Presentation;
  };
  CREATE SCALAR TYPE default::LightType EXTENDING enum<AMBIANT, POINT>;
  CREATE TYPE default::PresentationLight EXTENDING default::Object3D {
      CREATE REQUIRED LINK presentation -> default::Presentation;
      CREATE REQUIRED PROPERTY lightType -> default::LightType;
  };
  CREATE TYPE default::PresentationImage {
      CREATE REQUIRED LINK presenttationId -> default::Presentation;
      CREATE REQUIRED PROPERTY path -> std::str;
  };
};
