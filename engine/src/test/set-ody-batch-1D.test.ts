/**
 * Odyssey (ODY; B225), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Bearscape", () => {
  it("exiles two graveyard cards to make a 2/2 Bear", () => {
    const { game } = table();
    const scape = spawn(game, "Bearscape");
    lands(game, "Forest", 2);
    const yard = [toGraveyard(game, "Forest"), toGraveyard(game, "Forest")];
    activate(game, scape);
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
    for (const card of yard) expect(zone(game, card)).toBe("exile");
  });
});

describe("Deluge", () => {
  it("taps creatures without flying only", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Deluge"));
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[angel].tapped).toBe(false);
  });
});

describe("Recoup", () => {
  it("gives a sorcery in your graveyard flashback at its mana cost", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const divination = toGraveyard(game, "Divination");
    cast(game, toHand(game, "Recoup"), { targets: [ref(divination)] });
    const before = hand(game, A).length;
    cast(game, divination, { via: "flashback" });
    expect(hand(game, A).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("exile");
  });
});

describe("Rites of Refusal", () => {
  it("counters unless {3} per discarded card is paid", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const rites = toHand(game, "Rites of Refusal");
    const discards = [toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears")];
    a.chooseDiscardsFn = () => discards;
    pickModes(a, 0); // would pay, if it could
    cast(game, rites, { targets: [ref(divination)] });
    for (const card of discards) expect(zone(game, card)).toBe("graveyard");
    // Two discarded: {6} with two lands left — it can't be paid.
    expect(zone(game, divination)).toBe("graveyard");
    expect(game.state.zones.shared.stack.length).toBe(0);
  });

  it("with nothing discarded, the {0} can be paid", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    a.chooseDiscardsFn = () => [];
    pickModes(a, 0);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Rites of Refusal"), { targets: [ref(divination)] });
    expect(hand(game, A).length).toBe(before + 2);
  });
});

describe("Ghastly Demise", () => {
  it("destroys only a creature whose toughness is at most your graveyard size", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B); // 3/3
    toGraveyard(game, "Forest");
    toGraveyard(game, "Forest");
    cast(game, toHand(game, "Ghastly Demise"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    // Three cards now (the first Demise among them).
    cast(game, toHand(game, "Ghastly Demise"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Rites of Spring", () => {
  it("finds up to as many basic lands as cards discarded", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const forests = [toLibrary(game, "Forest"), toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    const discards = [toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears")];
    a.chooseDiscardsFn = () => discards;
    let max = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, m) => {
      max = m;
      return eligible.filter((id) => forests.includes(id)).slice(0, 2);
    };
    cast(game, toHand(game, "Rites of Spring"));
    expect(max).toBe(2);
    expect(forests.filter((id) => zone(game, id) === "hand").length).toBe(2);
  });
});

describe("Confessor", () => {
  it("may gain 1 life for each card any player discards", () => {
    const { game, a } = table();
    spawn(game, "Confessor");
    pickModes(a, 0);
    const startLife = life(game, A);
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 2 }, []);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(graveyard(game, B).length).toBe(2);
    expect(life(game, A)).toBe(startLife + 2);
  });
});

describe("Divert", () => {
  it("changes the spell's target when its controller doesn't pay {2}", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickTargets(a, bears);
    const startLife = life(game, B);
    cast(game, toHand(game, "Divert"), { targets: [ref(bolt)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(startLife);
  });
});

describe("Skycloud Egg", () => {
  it("adds {W}{U} and draws a card", () => {
    const { game } = table();
    const egg = spawn(game, "Skycloud Egg");
    lands(game, "Wastes", 2);
    const before = hand(game, A).length;
    activate(game, egg);
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, egg)).toBe("graveyard");
    const pool = game.state.players[A].manaPool;
    expect(JSON.stringify(pool)).toMatch(/W/);
    expect(JSON.stringify(pool)).toMatch(/U/);
  });
});

describe("Demoralize", () => {
  it("gives every creature menace: one blocker isn't enough", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Demoralize"));
    expect(keywords(game, giant).has("menace")).toBe(true);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.menaceAttackers).toEqual([bears]);
  });

  it("with threshold, creatures can't block this turn, even one that arrives later", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Forest");
    cast(game, toHand(game, "Demoralize"));
    const late = spawn(game, "Hill Giant", B);
    let asked = false;
    b.declareBlockersFn = () => {
      asked = true;
      return [
        { blocker: late, attacker: bears },
        { blocker: giant, attacker: bears },
      ];
    };
    const startLife = life(game, B);
    attack(game, a, [bears]);
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(startLife - 2);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Nantuko Mentor", () => {
  it("gives +X/+X where X is the target's power", () => {
    const { game } = table();
    const mentor = spawn(game, "Nantuko Mentor");
    lands(game, "Forest", 3);
    const giant = spawn(game, "Hill Giant");
    activate(game, mentor, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Ancestral Tribute", () => {
  it("gains 2 life per card in your graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Forest");
    const startLife = life(game, A);
    cast(game, toHand(game, "Ancestral Tribute"));
    expect(life(game, A)).toBe(startLife + 8);
  });
});
