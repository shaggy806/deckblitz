/**
 * Shards of Alara and Magic 2011, group E: the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Covenant of Minds", () => {
  it("puts the three revealed cards into your hand when the opponent lets you", () => {
    const { game, b } = table();
    lands(game, "Island", 5);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Memnite")];
    const covenant = toHand(game, "Covenant of Minds");
    const before = hand(game).length;
    pickModes(b, 0);
    cast(game, covenant, { targets: [ref(B)] });
    for (const id of top) expect(zone(game, id)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("otherwise puts them into your graveyard and you draw five", () => {
    const { game, b } = table();
    lands(game, "Island", 5);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Memnite")];
    const covenant = toHand(game, "Covenant of Minds");
    const before = hand(game).length;
    pickModes(b, 1);
    cast(game, covenant, { targets: [ref(B)] });
    for (const id of top) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 5);
  });
});

describe("Branching Bolt", () => {
  it("deals 3 to a flier and 3 to a non-flier with both modes", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const drake = spawn(game, "Wind Drake", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Branching Bolt"), { modes: [0, 1], targets: [ref(drake), ref(giant)] });
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("won't let the flying mode target a non-flier", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Branching Bolt"), { modes: [0], targets: [ref(giant)] })).toThrow();
  });
});

describe("Ancient Hellkite", () => {
  it("pings a defending player's creature only while attacking", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const kite = spawn(game, "Ancient Hellkite");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, kite, 0, { targets: [ref(bears)] })).toThrow();
    a.declareAttackersFn = () => [{ attacker: kite, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, kite, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Chandra's Spitfire", () => {
  it("gets +3/+0 when an opponent is dealt noncombat damage", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const spitfire = spawn(game, "Chandra's Spitfire");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, spitfire)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Gift of the Gargantuan", () => {
  it("takes a creature and a land, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const memnite = toLibrary(game, "Memnite");
    const forest = toLibrary(game, "Forest");
    const shock = toLibrary(game, "Shock");
    const bears = toLibrary(game, "Grizzly Bears");
    let pick = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      pick += 1;
      if (pick === 1) return eligible.includes(bears) ? [bears] : [];
      if (pick === 2) return eligible.includes(forest) && !eligible.includes(bears) ? [forest] : [];
      return [...eligible];
    };
    cast(game, toHand(game, "Gift of the Gargantuan"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, memnite)).toBe("library");
    expect(zone(game, shock)).toBe("library");
  });
});

describe("Dragon's Herald", () => {
  it("sacrifices a black, a red (itself) and a green creature to fetch Hellkite Overlord", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const herald = spawn(game, "Dragon's Herald");
    const skeletons = spawn(game, "Drudge Skeletons");
    const elves = spawn(game, "Llanowar Elves");
    const overlord = toLibrary(game, "Hellkite Overlord");
    pickFromZone(a, overlord);
    activate(game, herald);
    settle(game);
    for (const id of [herald, skeletons, elves]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, overlord)).toBe("battlefield");
  });

  it("can't be activated without a creature of each color", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const herald = spawn(game, "Dragon's Herald");
    spawn(game, "Llanowar Elves");
    expect(() => activate(game, herald)).toThrow();
  });
});

describe("Windwright Mage", () => {
  it("flies only while an artifact card is in your graveyard", () => {
    const { game } = table();
    const mage = spawn(game, "Windwright Mage");
    toGraveyard(game, "Grizzly Bears");
    expect(keywords(game, mage).has("flying")).toBe(false);
    toGraveyard(game, "Memnite");
    expect(keywords(game, mage).has("flying")).toBe(true);
    expect(graveyard(game).length).toBe(2);
  });
});

describe("Godtoucher", () => {
  it("shields only a creature with power 5 or greater", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const toucher = spawn(game, "Godtoucher");
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, toucher, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, toucher, 0, { targets: [ref(wurm)] });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});

describe("Mitotic Slime", () => {
  it("splits into two 2/2 Oozes, each splitting into two 1/1s", () => {
    const { game } = table();
    const slime = spawn(game, "Mitotic Slime");
    destroy(game, slime);
    settle(game);
    expect(tokensNamed(game, "2/2 Splitting Ooze Token", A)).toBe(2);
    const twos = named(game, "2/2 Splitting Ooze Token", A);
    expect(pt(game, twos[0])).toEqual({ power: 2, toughness: 2 });
    destroy(game, twos[0]);
    settle(game);
    expect(tokensNamed(game, "1/1 Ooze Token", A)).toBe(2);
    expect(tokensNamed(game, "2/2 Splitting Ooze Token", A)).toBe(1);
  });
});

describe("Gargoyle Sentinel", () => {
  it("loses defender and gains flying until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const gargoyle = spawn(game, "Gargoyle Sentinel");
    activate(game, gargoyle);
    expect(keywords(game, gargoyle).has("defender")).toBe(false);
    expect(keywords(game, gargoyle).has("flying")).toBe(true);
  });
});

describe("Earth Servant", () => {
  it("gets +0/+1 per Mountain you control", () => {
    const { game } = table();
    const servant = spawn(game, "Earth Servant");
    lands(game, "Mountain", 3);
    lands(game, "Mountain", 2, B);
    expect(pt(game, servant)).toEqual({ power: 4, toughness: 7 });
  });
});
