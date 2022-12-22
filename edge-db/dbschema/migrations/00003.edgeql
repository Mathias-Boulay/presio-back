CREATE MIGRATION m13a72wtlg3pdz3wa6locetxjfdssmgytc4epxgf5udttiarqz4y3a
    ONTO m1srlyr7ihep5cmiykdy7e67c3kbywsskqxzncmndmge52zenkim4a
{
  ALTER TYPE default::Presentation {
      ALTER LINK owner {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::PresentationDevice {
      ALTER LINK presentation {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::PresentationLight {
      ALTER LINK presentation {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
