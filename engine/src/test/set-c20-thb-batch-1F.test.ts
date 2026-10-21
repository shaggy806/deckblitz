import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Netherborn Altar", () => {
  it("puts your commander into your hand, then costs 3 life for each soul counter", () => {
    const { game } = table();
    const wurm = game.debugSpawn("Craw Wurm", A, "command");
    game.state.objects[wurm].isCommander = true;
    const altar = spawn(game, "Netherborn Altar");
    activate(game, altar, 0, { settle: false });
    for (let i = 0; i < 6; i += 1) {
      game.advanceUntil((s) => s.awaiting !== null || quiet(s));
      const awaiting = game.state.awaiting;
      if (awaiting === null) break;
      if (awaiting.kind === "choose-from-zone") game.dispatch({ type: "choose-from-zone", player: A, chosen: [wurm] });
      else if (awaiting.kind === "commander-replacement")
        game.dispatch({ type: "commander-replacement", player: A, toCommandZone: false });
      else break;
    }
    expect(zone(game, wurm)).toBe("hand");
    expect(counters(game, altar, "soul")).toBe(1);
    expect(life(game)).toBe(17);
    // A second time, with no commander there: only the life, for two counters.
    game.state.objects[altar].tapped = false;
    activate(game, altar, 0);
    expect(counters(game, altar, "soul")).toBe(2);
    expect(life(game)).toBe(11);
  });
});

describe("Otrimi, the Ever-Playful", () => {
  it("returns only a creature card with mutate from your graveyard", () => {
    const { game, a } = table();
    const otrimi = spawn(game, "Otrimi, the Ever-Playful");
    const recluse = toGraveyard(game, "Glowstone Recluse");
    const heron = toGraveyard(game, "Dreamtail Heron");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [recluse]);
    attack(game, a, [otrimi]);
    expect([...seen.offered[0]].sort()).toEqual([recluse, heron].sort());
    expect(zone(game, recluse)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });
});

describe("Fireflux Squad", () => {
  it("exiles another attacker and puts the first creature card revealed onto the battlefield attacking", () => {
    const { game, a } = table();
    const squad = spawn(game, "Fireflux Squad");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = toLibrary(game, "Craw Wurm");
    toLibrary(game, "Wastes");
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [squad, bears]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].tapped).toBe(true);
    // Squad 4 + Wurm 6; the exiled Bears deal nothing.
    expect(life(game, B)).toBe(10);
  });

  it("declined, exiles nothing and reveals nothing", () => {
    const { game, a } = table();
    const squad = spawn(game, "Fireflux Squad");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = toLibrary(game, "Craw Wurm");
    pickTargets(a, bears);
    pickModes(a);
    attack(game, a, [squad, bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("library");
    expect(life(game, B)).toBe(14);
  });
});

describe("Tymaret, Chosen from Death", () => {
  it("has toughness equal to devotion to black and gains 1 life per creature card it exiles", () => {
    const { game } = table();
    const tymaret = spawn(game, "Tymaret, Chosen from Death");
    expect(pt(game, tymaret)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Vampire Nighthawk");
    expect(pt(game, tymaret).toughness).toBe(4);
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const wastes = toGraveyard(game, "Wastes", B);
    activate(game, tymaret, 0, { targets: [ref(bears), ref(wastes)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, wastes)).toBe("exile");
    expect(life(game)).toBe(21);
  });
});

describe("Acolyte of Affliction", () => {
  it("mills two, then may return a permanent card — one just milled", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, bears);
    enter(game, "Acolyte of Affliction");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Eutropia the Twice-Favored", () => {
  it("an enchantment entering puts a +1/+1 counter on target creature, which gains flying", () => {
    const { game, a } = table();
    spawn(game, "Eutropia the Twice-Favored");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Glorious Anthem");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Mantle of the Wolf", () => {
  it("gives +4/+4, and put into a graveyard from the battlefield makes two Wolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const mantle = toHand(game, "Mantle of the Wolf");
    cast(game, mantle, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    destroy(game, mantle);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(2);
  });
});

describe("Taranika, Akroan Veteran", () => {
  it("untaps another creature, which is a 4/4 indestructible until end of turn", () => {
    const { game, a } = table();
    const taranika = spawn(game, "Taranika, Akroan Veteran");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, bears);
    attack(game, a, [taranika]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Aphemia, the Cacophony", () => {
  it("exiles an enchantment card from your graveyard at your end step for a Zombie", () => {
    const { game, a } = table();
    spawn(game, "Aphemia, the Cacophony");
    const pacifism = toGraveyard(game, "Pacifism");
    pickModes(a, 0);
    pickFromZone(a, pacifism);
    toStep(game, "end");
    settle(game);
    expect(zone(game, pacifism)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Elspeth, Undaunted Hero", () => {
  it("−8: creatures you control gain flying and get +X/+X for devotion to white", () => {
    const { game } = table();
    const elspeth = spawn(game, "Elspeth, Undaunted Hero");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    // Nine loyalty, so she's still there to count toward devotion as it
    // resolves (the ruling) — at eight she'd be gone, and X would be 0.
    loyalty(game, elspeth, -8, { atLeast: 9 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Grasping Giant", () => {
  it("exiles its blocker until it leaves the battlefield", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Grasping Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, bears)).toBe("exile");
    // Still blocked: no damage to Bob.
    expect(life(game, B)).toBe(20);
    destroy(game, giant);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("Phalanx Tactics", () => {
  it("gives the target +2/+1 and each other creature you control +1/+1", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Phalanx Tactics"), { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Alirios, Enraptured", () => {
  it("enters tapped with a Reflection, and doesn't untap while you control one", () => {
    const { game } = table();
    const alirios = enter(game, "Alirios, Enraptured");
    expect(game.state.objects[alirios].tapped).toBe(true);
    expect(tokensNamed(game, "Reflection Token", A)).toBe(1);
    toStep(game, "precombat-main");
    expect(game.state.objects[alirios].tapped).toBe(true);
    destroy(game, named(game, "Reflection Token", A)[0]);
    toStep(game, "precombat-main");
    expect(game.state.objects[alirios].tapped).toBe(false);
  });
});

describe("Fruit of Tizerus", () => {
  it("escapes from the graveyard, exiling three other cards", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const fruit = toGraveyard(game, "Fruit of Tizerus");
    const others = [toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes")];
    cast(game, fruit, { targets: [ref(B)], via: "escape" });
    expect(life(game, B)).toBe(18);
    for (const id of others) expect(zone(game, id)).toBe("exile");
  });
});
