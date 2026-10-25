import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
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

const energy = (game: ReturnType<typeof table>["game"], p = A): number => game.state.players[p].energy ?? 0;

describe("Akiri, Line-Slinger", () => {
  it("gets +1/+0 for each artifact you control", () => {
    const { game } = table();
    const akiri = spawn(game, "Akiri, Line-Slinger");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    expect(pt(game, akiri)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Prismatic Geoscope", () => {
  it("enters tapped and adds one mana per basic land type", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Island");
    const scope = enter(game, "Prismatic Geoscope");
    expect(game.state.objects[scope].tapped).toBe(true);
    game.state.objects[scope].tapped = false;
    activate(game, scope, 0);
    const pool = game.state.players[A].manaPool;
    expect(pool.length).toBe(2);
  });
});

describe("Saheeli Rai", () => {
  it("+1 scries 1 and deals 1 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    const saheeli = spawn(game, "Saheeli Rai");
    loyalty(game, saheeli, 1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("−2 makes a hasty artifact copy that's exiled at the next end step", () => {
    const { game } = table();
    const saheeli = spawn(game, "Saheeli Rai");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, saheeli, -2, { targets: [{ kind: "object", object: bears }] });
    const copy = named(game, "Grizzly Bears").find((id) => id !== bears)!;
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(keywords(game, copy).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
  });
});

describe("Aetherstorm Roc", () => {
  it("gets energy for itself and others entering, then pays it to tap a blocker", () => {
    const { game, a } = table();
    const roc = enter(game, "Aetherstorm Roc");
    enter(game, "Grizzly Bears");
    expect(energy(game)).toBe(2);
    const wall = spawn(game, "Grizzly Bears", B);
    pickTargets(a, wall);
    pickModes(a, 0);
    attack(game, a, [roc]);
    expect(energy(game)).toBe(0);
    expect(counters(game, roc)).toBe(1);
    expect(game.state.objects[wall].tapped).toBe(true);
  });

  it("works with no target chosen", () => {
    const { game, a } = table();
    const roc = enter(game, "Aetherstorm Roc");
    game.state.players[A].energy = 2;
    pickTargets(a, null);
    pickModes(a, 0);
    attack(game, a, [roc]);
    expect(counters(game, roc)).toBe(1);
  });
});

describe("Wildest Dreams", () => {
  it("returns exactly X cards and exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Craw Wurm");
    const dreams = toHand(game, "Wildest Dreams");
    cast(game, dreams, { x: 2, targets: [{ kind: "object", object: one }, { kind: "object", object: two }] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(game.state.zones.shared.exile).toContain(dreams);
  });
});

describe("Cultivator of Blades", () => {
  it("may give other attackers +X/+X equal to its power", () => {
    const { game, a } = table();
    const cultivator = spawn(game, "Cultivator of Blades");
    game.state.objects[cultivator].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    let seen = { power: 0, toughness: 0 };
    a.declareAttackersFn = () => [
      { attacker: cultivator, defender: B },
      { attacker: bears, defender: B },
    ];
    toStep(game, "declare-blockers");
    settle(game);
    seen = pt(game, bears);
    expect(seen).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, cultivator)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Night Market Lookout", () => {
  it("drains each opponent when it becomes tapped", () => {
    const { game, a } = table({ players: 3 });
    const lookout = spawn(game, "Night Market Lookout");
    attack(game, a, [lookout]);
    expect(life(game, A)).toBe(21);
    expect(life(game, "carol" as typeof B)).toBe(19);
  });
});

describe("Ovalchase Daredevil", () => {
  it("may return from the graveyard when an artifact you control enters", () => {
    const { game, a } = table();
    const daredevil = toGraveyard(game, "Ovalchase Daredevil");
    pickModes(a, 0);
    enter(game, "Sol Ring");
    expect(zone(game, daredevil)).toBe("hand");
  });
});

describe("Aether Theorist", () => {
  it("pays energy to scry", () => {
    const { game } = table();
    const theorist = enter(game, "Aether Theorist");
    expect(energy(game)).toBe(3);
    activate(game, theorist, 0);
    expect(energy(game)).toBe(2);
  });
});

describe("Nissa, Nature's Artisan", () => {
  it("−4 puts the lands onto the battlefield and the rest into your hand", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Nature's Artisan");
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const before = hand(game).length;
    loyalty(game, nissa, -4);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Renegade Freighter", () => {
  it("gets +1/+1 and trample when it attacks", () => {
    const { game, a } = table();
    const freighter = spawn(game, "Renegade Freighter");
    spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    activate(game, freighter, 0);
    a.declareAttackersFn = () => [{ attacker: freighter, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, freighter)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, freighter).has("trample")).toBe(true);
  });
});

describe("Tezzeret's Ambition", () => {
  it("discards a card only with no artifacts", () => {
    const { game } = table();
    lands(game, "Island", 10);
    const ambition = toHand(game, "Tezzeret's Ambition");
    const before = hand(game).length;
    cast(game, ambition);
    expect(hand(game).length).toBe(before - 1 + 3 - 1);
    spawn(game, "Sol Ring");
    const again = toHand(game, "Tezzeret's Ambition");
    const mid = hand(game).length;
    cast(game, again);
    expect(hand(game).length).toBe(mid - 1 + 3);
  });
});

describe("Inventor's Goggles", () => {
  it("may attach to an Artificer you control as it enters", () => {
    const { game, a } = table();
    const goggles = spawn(game, "Inventor's Goggles");
    pickModes(a, 0);
    const apprentice = enter(game, "Inventor's Apprentice");
    expect(game.state.objects[goggles].attachedTo).toBe(apprentice);
    // 1/2, +1/+1 for the artifact, +1/+2 for the Goggles.
    expect(pt(game, apprentice)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Verdant Crescendo", () => {
  it("fetches a tapped basic and Nissa from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    const nissa = toGraveyard(game, "Nissa, Nature's Artisan");
    const picks = [forest, nissa];
    a.chooseFromZoneFn = () => [picks.shift()!];
    const crescendo = toHand(game, "Verdant Crescendo");
    cast(game, crescendo);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, nissa)).toBe("hand");
  });
});

describe("Malfunction", () => {
  it("taps the enchanted artifact and keeps it tapped", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const ring = spawn(game, "Sol Ring", B);
    const malfunction = toHand(game, "Malfunction");
    cast(game, malfunction, { targets: [{ kind: "object", object: ring }] });
    expect(game.state.objects[ring].tapped).toBe(true);
    toStep(game, "upkeep", B);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Hazardous Conditions", () => {
  it("shrinks only creatures with no counters of any kind", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Swamp", 2);
    const bare = spawn(game, "Craw Wurm", B);
    const marked = spawn(game, "Craw Wurm", B);
    game.state.objects[marked].counters["charge"] = 1;
    const spell = toHand(game, "Hazardous Conditions");
    cast(game, spell);
    expect(pt(game, bare)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, marked)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Cultivator of Blades fabricate", () => {
  it("can make two Servos", () => {
    const { game, a } = table();
    pickModes(a, 1);
    enter(game, "Cultivator of Blades");
    expect(tokensNamed(game, "Servo Token", A)).toBe(2);
  });
});
