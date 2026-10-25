import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  keywords,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("KTK / C14 batch 1, group E", () => {
  it("Malicious Affliction copies itself only if a creature died this turn", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    pickTargets(a, second);
    cast(game, toHand(game, "Malicious Affliction"), { targets: [ref(first)] });
    // No creature had died: no copy, so only the first Bears is destroyed.
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("battlefield");

    const third = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Malicious Affliction"), { targets: [ref(third)] });
    // Bears died earlier this turn: the copy, retargeted, takes the other one.
    expect(zone(game, third)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
  });

  it("End Hostilities destroys creatures and what's attached to them, not other permanents", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = spawn(game, "Pacifism", A);
    game.state.objects[aura].attachedTo = bears;
    const worn = spawn(game, "Bonesplitter", B);
    game.state.objects[worn].attachedTo = bears;
    const loose = spawn(game, "Bonesplitter", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "End Hostilities"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, worn)).toBe("graveyard");
    expect(zone(game, loose)).toBe("battlefield");
  });

  it("Flesh Carver's Horror is as big as its power when it died", () => {
    const { game } = table();
    const carver = spawn(game, "Flesh Carver", A);
    game.state.objects[carver].counters["+1/+1"] = 2;
    destroy(game, carver);
    const [horror] = named(game, "Horror Token (Black 0/0)", A);
    expect(horror).toBeDefined();
    expect(pt(game, horror)).toEqual({ power: 4, toughness: 4 });
  });

  it("Sorin's +1 lasts until its controller's next turn", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Solemn Visitor", A);
    const bears = spawn(game, "Grizzly Bears", A);
    loyalty(game, sorin, 1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    nextTurn(game); // bob's turn
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    nextTurn(game); // alice's next turn
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });

  it("Sorin's emblem makes each opponent sacrifice a creature at their upkeep", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Solemn Visitor", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    loyalty(game, sorin, -6, { atLeast: 6 });
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Kheru Bloodsucker drains only for a creature with toughness 4 or greater", () => {
    const { game } = table();
    spawn(game, "Kheru Bloodsucker", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const wurm = spawn(game, "Craw Wurm", A);
    destroy(game, bears);
    expect(life(game, B)).toBe(20);
    destroy(game, wurm);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("High Sentinels counts other creatures with a +1/+1 counter, not counters", () => {
    const { game } = table();
    const sentinels = spawn(game, "High Sentinels of Arashin", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    game.state.objects[bears].counters["+1/+1"] = 3;
    game.state.objects[giant].counters["+1/+1"] = 1;
    game.state.objects[sentinels].counters["+1/+1"] = 1;
    expect(counters(game, sentinels)).toBe(1);
    // 3/4 base, +1/+1 own counter, +2/+2 for the two others.
    expect(pt(game, sentinels)).toEqual({ power: 6, toughness: 7 });
  });

  it("Feed the Clan gains 10 instead of 5 with ferocious", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Feed the Clan"));
    expect(life(game, A)).toBe(25);
    spawn(game, "Craw Wurm", A);
    cast(game, toHand(game, "Feed the Clan"));
    expect(life(game, A)).toBe(35);
  });

  it("Kin-Tree Invocation's token is the greatest toughness among your creatures", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Sultai Soothsayer", A);
    spawn(game, "Mahamoti Djinn", B); // 5/6, but not yours
    lands(game, "Forest", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Kin-Tree Invocation"));
    expect(tokensNamed(game, "Spirit Warrior Token", A)).toBe(1);
    const [token] = named(game, "Spirit Warrior Token", A);
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
  });

  it("Goblinslide makes a hasty Goblin only if {1} is paid", () => {
    const { game, a } = table();
    spawn(game, "Goblinslide", A);
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Goblin Token (Haste)", A)).toBe(1);
    const [goblin] = named(game, "Goblin Token (Haste)", A);
    expect(keywords(game, goblin).has("haste")).toBe(true);
    // Declined: no Goblin.
    pickModes(a);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Goblin Token (Haste)", A)).toBe(1);
  });
});
