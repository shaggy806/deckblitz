/**
 * Modern Horizons 2 / Commander 2021, group b: the cards whose behaviour is
 * more than a stat line or an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Deepwood Denizen", () => {
  it("costs {1} less for each +1/+1 counter on creatures you control, across creatures", () => {
    const { game } = table();
    const denizen = spawn(game, "Deepwood Denizen");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    const action = { type: "activate-ability", player: A, source: denizen, abilityIndex: 0, targets: [] } as const;
    // {5}{G} with three lands: not yet.
    expect(game.canDispatch(action)).not.toBeNull();
    game.state.objects[denizen].counters["+1/+1"] = 1;
    game.state.objects[bears].counters["+1/+1"] = 2;
    // An opponent's creature's counters don't count.
    game.state.objects[theirs].counters["+1/+1"] = 5;
    // Three counters: {2}{G}.
    const before = hand(game).length;
    activate(game, denizen);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Reinterpret", () => {
  it("counters the spell and offers a free cast up to its mana value, its {X} counted", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const serpent = toHand(game, "Stonecoil Serpent");
    cast(game, serpent, { x: 4, settle: false });
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const wurm = toHand(game, "Craw Wurm");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      return null;
    };
    cast(game, toHand(game, "Reinterpret"), { targets: [ref(serpent)] });
    expect(zone(game, serpent)).toBe("graveyard");
    expect(offered).toContain(bears);
    expect(offered).toContain(giant);
    expect(offered).not.toContain(wurm);
  });
});

describe("Healing Technique", () => {
  it("each copy returns a card from its own controller's graveyard and gains its mana value; the card is exiled", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4);
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    pickTargets(b, wurm);
    const card = toHand(game, "Healing Technique");
    cast(game, card, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wurm)).toBe("hand");
    expect(hand(game, B)).toContain(wurm);
    expect(life(game, A)).toBe(20 + 4 + 2);
    expect(life(game, B)).toBe(20 + 6);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Calibrated Blast", () => {
  it("reveals to a nonland card, bottoms everything, and deals its mana value to a target chosen then", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    pickTargets(a, B);
    cast(game, toHand(game, "Calibrated Blast"));
    expect(life(game, B)).toBe(16);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3)).toContain(giant);
    expect(game.state.objects[library[0]].cardName).toBe("Wastes");
  });
});

describe("Young Necromancer", () => {
  it("may exile two cards from your graveyard; when you do, returns a creature card", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const w1 = toGraveyard(game, "Wastes");
    const w2 = toGraveyard(game, "Wastes");
    pickModes(a, 0);
    pickFromZone(a, w1, w2);
    pickTargets(a, giant);
    enter(game, "Young Necromancer");
    expect(zone(game, w1)).toBe("exile");
    expect(zone(game, w2)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("isn't offered with fewer than two cards to exile", () => {
    const { game, a } = table();
    toGraveyard(game, "Hill Giant");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    enter(game, "Young Necromancer");
    expect(asked).toBe(0);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Trudge Garden", () => {
  it("whenever you gain life, you may pay {2} for a 4/4 trampling Fungus Beast", () => {
    const { game, a } = table();
    spawn(game, "Trudge Garden");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    enter(game, "Lone Missionary");
    expect(life(game)).toBe(24);
    expect(tokensNamed(game, "Fungus Beast Token", A)).toBe(1);
  });
});

describe("Said // Done", () => {
  it("Done taps up to two creatures, which don't untap during their controller's next untap step", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Said // Done"), { face: 2, targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
  });
});

describe("Captured by Lagacs", () => {
  it("enchants a creature and supports up to two creatures, the enchanted one included", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, mine, theirs);
    const aura = toHand(game, "Captured by Lagacs");
    cast(game, aura, { targets: [ref(theirs)] });
    expect(game.state.objects[aura].attachedTo).toBe(theirs);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });
});
