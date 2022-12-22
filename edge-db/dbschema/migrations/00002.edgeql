CREATE MIGRATION m1srlyr7ihep5cmiykdy7e67c3kbywsskqxzncmndmge52zenkim4a
    ONTO m1fizig47kpuxtk744mf2gcbjcwvruv5ge7pzeixlr7ebdhaff277q
{
  ALTER TYPE default::PresentationDevice {
      CREATE PROPERTY imagePath -> std::str;
  };
  DROP TYPE default::PresentationImage;
};
