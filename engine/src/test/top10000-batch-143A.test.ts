/**
 * Batch 143, group A — EDHREC ranks 7707–7947. One test per clause most
 * likely to be wrong: Palinchron's untap reaching any player's lands,
 * Lorthos's paid tap-down that outlasts the next untap step, Liliana's
 * mill-and-return and her emblem's count, Verdurous Gearhulk's division,
 * Grid Monitor's prohibition, Angel of Glory's Rise's exile-then-return,
 * Amy Rose's pump read after the attach, Admonition Angel's linked exile,
 * Bloodmark Mentor's colour filter, Psychotrope Thallid's Saproling draw and
 * Silklash Spider's X.
 */
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
  graveyard,
  hand,
  keywords,
  lands,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
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

describe("Palinchron", () => {
  it("untaps up to seven lands, any player's", () => {
    const { game, a } = table();
    const mine = lands(game, "Island", 3);
    const theirs = spawn(game, "Island", B, { tapped: true });
    for (const id of mine) game.state.objects[id].tapped = true;
    const seen = pickPermanents(a, ...mine, theirs);
    enter(game, "Palinchron");
    expect(seen.offered).toContain(theirs);
    for (const id of [...mine, theirs]) expect(game.state.objects[id].tapped).toBe(false);
  });
});

describe("Lorthos, the Tidemaker", () => {
  it("pays {8} to tap its targets, which skip their controller's next untap step", () => {
    const { game, a } = table();
    const lorthos = spawn(game, "Lorthos, the Tidemaker");
    lands(game, "Wastes", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    pickTargets(a, bears, land);
    pickModes(a, 0);
    attack(game, a, [lorthos]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(true);
  });

  it("taps nothing when the {8} isn't paid", () => {
    const { game, a } = table();
    const lorthos = spawn(game, "Lorthos, the Tidemaker");
    lands(game, "Wastes", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a);
    attack(game, a, [lorthos]);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Liliana, the Last Hope", () => {
  it("−2 mills two, then may return a creature card from the graveyard", () => {
    const { game, a } = table();
    const lili = spawn(game, "Liliana, the Last Hope");
    const first = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, first);
    loyalty(game, lili, -2);
    expect(zone(game, first)).toBe("hand");
    expect(graveyard(game).length).toBe(1);
  });

  it("the emblem makes two plus the number of Zombies you control", () => {
    const { game } = table();
    const lili = spawn(game, "Liliana, the Last Hope");
    spawn(game, "Walking Corpse");
    loyalty(game, lili, -7, { atLeast: 7 });
    toStep(game, "end");
    settle(game);
    // Two plus the one Zombie, counted as the trigger resolves.
    expect(tokensNamed(game, "Zombie Token", A)).toBe(3);
  });
});

describe("Verdurous Gearhulk", () => {
  it("distributes four +1/+1 counters as chosen, itself included", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    const gearhulk = toHand(game, "Verdurous Gearhulk");
    cast(game, gearhulk, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(gearhulk)], division: [3, 1] });
    settle(game);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, gearhulk)).toBe(1);
  });
});

describe("Grid Monitor", () => {
  it("stops you casting creature spells, not other spells", () => {
    const { game } = table();
    spawn(game, "Grid Monitor");
    lands(game, "Mountain", 3);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("Angel of Glory's Rise", () => {
  it("exiles every Zombie, then returns only your Human creature cards", () => {
    const { game } = table();
    const corpse = spawn(game, "Walking Corpse", B);
    const vanguard = toGraveyard(game, "Elite Vanguard");
    const theirHuman = toGraveyard(game, "Elite Vanguard", B);
    const notHuman = toGraveyard(game, "Grizzly Bears");
    enter(game, "Angel of Glory's Rise");
    expect(zone(game, corpse)).toBe("exile");
    expect(named(game, "Elite Vanguard", A)).toHaveLength(1);
    expect(zone(game, theirHuman)).toBe("graveyard");
    expect(zone(game, notHuman)).toBe("graveyard");
    expect(zone(game, vanguard)).not.toBe("graveyard");
  });
});

describe("Amy Rose", () => {
  it("attaches the Equipment first, so the pump reads her equipped power", () => {
    const { game, a } = table();
    const amy = spawn(game, "Amy Rose");
    const blade = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, blade, bears);
    attack(game, a, [amy, bears]);
    expect(game.state.objects[blade].attachedTo).toBe(amy);
    expect(pt(game, amy).power).toBe(5);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 2 });
  });
});

describe("Admonition Angel", () => {
  it("may exile on landfall, and returns what it exiled as it leaves", () => {
    const { game, a } = table();
    const angel = spawn(game, "Admonition Angel");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Plains");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, angel);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Bloodmark Mentor", () => {
  it("gives first strike to your red creatures only", () => {
    const { game } = table();
    spawn(game, "Bloodmark Mentor");
    const goblin = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Raging Goblin", B);
    expect(keywords(game, goblin).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(keywords(game, theirs).has("first-strike")).toBe(false);
  });
});

describe("Psychotrope Thallid", () => {
  it("{1}, sacrifice a Saproling: draw a card", () => {
    const { game } = table();
    const thallid = spawn(game, "Psychotrope Thallid");
    const saproling = spawn(game, "Saproling Token");
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: thallid, abilityIndex: 1, targets: [], sacrifice: saproling });
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
    expect(hand(game).length - before).toBe(1);
  });
});

describe("Silklash Spider", () => {
  it("deals X damage to each creature with flying", () => {
    const { game } = table();
    const spider = spawn(game, "Silklash Spider");
    const crow = spawn(game, "Storm Crow", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    activate(game, spider, 0, { x: 2 });
    expect(zone(game, crow)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, spider)).toBe("battlefield");
  });
});
