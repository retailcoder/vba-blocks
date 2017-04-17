use std::process::{Command, exit};

pub fn add(block: &str, git: Option<&str>, path: Option<&str>) {
  let git_value = git.unwrap_or("(no git)");
  let path_value = path.unwrap_or("(no path)");

  println!("add {} {} {}", block, git_value, path_value);
} 

pub fn update(blocks: Option<Vec<&str>>) {
  let blocks_value = match blocks {
    Some(blocks) => blocks.join(" "),
    None => "(all blocks)".to_string(),
  };

  println!("update {}", blocks_value);
}

pub fn remove(blocks: Vec<&str>) {
  println!("remove {}", blocks.join(" "));
}

pub struct BuildOptions<'a> {
  pub release: bool,
  pub features: Option<Vec<&'a str>>,
  pub all_features: bool,
  pub no_default_features: bool,
}

pub fn build(options: BuildOptions) {
  let features = options.features.unwrap_or(vec![]);

  println!("Build, release: {}, features: {}, all-features: {}, no-default-features: {}",
    options.release,
    match features.len() {
      0 => "(no features)".to_string(),
      _ => features.join(" "),
    },
    options.all_features,
    options.no_default_features
  );

  match run("build", &features) {
    Ok(stdout) => println!("{}", stdout),
    Err(stderr) => {
      println!("ERROR: {}", stderr);
      exit(1);
    }
  }

  println!("Done.");
}

pub fn test(filters: Vec<&str>) {
  let filter_value = match filters.len() {
    0 => "(no filters)".to_string(),
    _ => filters.join(" "),
  };

  println!("test, filters: {}", filter_value);
}

pub fn init(name: Option<&str>) {
  let name_value = name.unwrap_or("(no name)");

  println!("init, name: {}", name_value);
}

pub fn version(version: &str) {
  println!("version {}", version);
}

pub struct PublishOptions {
  pub dry_run: bool,
}

pub fn publish(options: PublishOptions) {
  println!("publish, dry-run: {}", options.dry_run);
}

pub fn list() {
  println!("list");
}

pub fn search(query: &str) {
  println!("search {}", query);
}

fn run(name: &str, args: &Vec<&str>) -> Result<String, String> {
  let output = if cfg!(target_os = "windows") {
    let command = format!("cscript scripts/run.vbs {} {}", name, args.join(" "));
    Command::new("cmd")
      .args(&["/C", &command])
      .output()
      .expect("Failed to execute script")
  } else {
    let command = format!("osascript scripts/run.scpt {} {}", name, args.join(" "));
    Command::new("sh")
      .args(&["-c", &command])
      .output()
      .expect("Failed to execute script")
  };

  if output.stderr.len() > 0 {
    Err(String::from_utf8(output.stderr).unwrap())
  } else {
    Ok(String::from_utf8(output.stdout).unwrap())
  }
}