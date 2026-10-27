import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Infernal Genesis", () => {
  it("on each player's upkeep that player mills a card and creates Minions equal to its mana value", () => {
    const { game } = table();
    spawn(game, "Infernal Genesis");
    const bears = toLibrary(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Minion Token", B)).toBe(2);
    expect(tokensNamed(game, "Minion Token", A)).toBe(0);
  });

  it("a milled land makes no tokens", () => {
    const { game } = table();
    spawn(game, "Infernal Genesis");
    nextTurn(game);
    expect(tokensNamed(game, "Minion Token")).toBe(0);
  });
});

describe("Calming Verse", () => {
  it("with every land tapped, only the enchantments you don't control are destroyed", () => {
    const { game } = table();
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Calming Verse"));
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("with an untapped land left, yours are destroyed too", () => {
    const { game } = table();
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Calming Verse"));
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Withdraw", () => {
  it("returns the first creature, and the second unless its controller pays {1}", () => {
    const { game, b } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Wastes", 1, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Withdraw"), { targets: [ref(first), ref(second)] });
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("battlefield");
  });

  it("returns both when the {1} isn't paid", () => {
    const { game, b } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Wastes", 1, B);
    pickModes(b);
    cast(game, toHand(game, "Withdraw"), { targets: [ref(first), ref(second)] });
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
  });
});

describe("Rhystic Lightning", () => {
  it("deals 2 to a player who pays {2}", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    lands(game, "Wastes", 2, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Rhystic Lightning"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });

  it("deals 4 when its controller doesn't pay", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    lands(game, "Wastes", 2, B);
    pickModes(b);
    const ogre = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rhystic Lightning"), { targets: [ref(ogre)] });
    expect(zone(game, ogre)).toBe("graveyard");
  });
});

describe("Well of Discovery", () => {
  it("draws at your end step only if you control no untapped lands", () => {
    const { game } = table();
    spawn(game, "Well of Discovery");
    spawn(game, "Wastes", A, { tapped: true });
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw with an untapped land", () => {
    const { game } = table();
    spawn(game, "Well of Discovery");
    spawn(game, "Wastes");
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Gulf Squid", () => {
  it("taps all lands the target player controls", () => {
    const { game, a } = table();
    const theirs = lands(game, "Wastes", 3, B);
    pickTargets(a, B);
    const squid = toHand(game, "Gulf Squid");
    const mine = lands(game, "Island", 5);
    cast(game, squid);
    for (const land of theirs) expect(game.state.objects[land].tapped).toBe(true);
    // Four paid for the Squid; the fifth, alice's own, stays untapped.
    expect(mine.filter((land) => !game.state.objects[land].tapped)).toHaveLength(1);
  });
});

describe("Search for Survivors", () => {
  it("puts a creature card chosen at random onto the battlefield", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Search for Survivors"));
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("exiles a noncreature card", () => {
    const { game } = table();
    const land = toGraveyard(game, "Wastes");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Search for Survivors"));
    expect(zone(game, land)).toBe("exile");
  });
});

describe("Chimeric Idol", () => {
  it("taps all your lands and becomes a 3/3 Turtle artifact creature", () => {
    const { game } = table();
    const idol = spawn(game, "Chimeric Idol");
    const mine = lands(game, "Wastes", 2);
    const theirs = spawn(game, "Wastes", B);
    activate(game, idol);
    for (const land of mine) expect(game.state.objects[land].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(types(game, idol)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, idol)).toContain("Turtle");
    expect(pt(game, idol)).toEqual({ power: 3, toughness: 3 });
    expect(named(game, "Chimeric Idol")).toHaveLength(1);
  });
});
