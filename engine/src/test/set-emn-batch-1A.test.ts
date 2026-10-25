import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Four card types in alice's graveyard: delirium. */
function delirium(game: Game): void {
  toGraveyard(game, "Grizzly Bears");
  toGraveyard(game, "Wastes");
  toGraveyard(game, "Shock");
  toGraveyard(game, "Sol Ring");
}

describe("Lupine Prototype", () => {
  it("can't attack while every player has a card in hand", () => {
    const { game, a } = table();
    const lupine = spawn(game, "Lupine Prototype");
    attack(game, a, [lupine]);
    expect(life(game, B)).toBe(20);
  });

  it("attacks once a player has no cards in hand", () => {
    const { game, a } = table();
    const lupine = spawn(game, "Lupine Prototype");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "each-opponent" }, []);
    settle(game);
    expect(hand(game, B)).toHaveLength(0);
    attack(game, a, [lupine]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Identity Thief", () => {
  it("exiles the target, becomes a copy of it, and the card returns at the end step", () => {
    const { game, a } = table();
    const thief = spawn(game, "Identity Thief");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a, 0);
    attack(game, a, [thief]);
    expect(zone(game, wurm)).toBe("exile");
    expect(game.state.objects[thief].cardName).toBe("Identity Thief");
    expect(pt(game, thief)).toEqual({ power: 6, toughness: 4 });
    expect(life(game, B)).toBe(14);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Craw Wurm", B)).toHaveLength(1);
  });

  it("does nothing when you decline", () => {
    const { game, a } = table();
    const thief = spawn(game, "Identity Thief");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a);
    attack(game, a, [thief]);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(pt(game, thief)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Campaign of Vengeance", () => {
  it("drains once for each attacking creature", () => {
    const { game, a } = table();
    spawn(game, "Campaign of Vengeance");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    attack(game, a, [one, two]);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20 - 2 - 4);
  });
});

describe("Crop Sigil", () => {
  it("with delirium, returns a creature card and a land card", () => {
    const { game } = table();
    delirium(game);
    const sigil = spawn(game, "Crop Sigil");
    lands(game, "Forest", 3);
    const bears = graveyard(game, A).find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    const land = graveyard(game, A).find((id) => game.state.objects[id].cardName === "Wastes")!;
    activate(game, sigil, 0, { targets: [ref(bears), ref(land)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, land)).toBe("hand");
    expect(zone(game, sigil)).toBe("graveyard");
  });

  it("can't be activated without delirium", () => {
    const { game } = table();
    const sigil = spawn(game, "Crop Sigil");
    lands(game, "Forest", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, sigil, 0, { targets: [ref(bears), null] })).toThrow();
  });
});

describe("Waxing Moon", () => {
  it("transforms a Werewolf you control and gives your creatures trample", () => {
    const { game } = table();
    const howler = spawn(game, "Shrill Howler");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Waxing Moon"), { targets: [ref(howler)] });
    expect(game.state.objects[howler].cardName === "Howling Chorus" || pt(game, howler).toughness === 5).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("resolves with no target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Waxing Moon"), { targets: [null] });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Extricator of Sin", () => {
  it("may sacrifice another permanent for an Eldrazi Horror", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.choosePermanentsFn = () => [bears];
    const extricator = enter(game, "Extricator of Sin");
    expect(zone(game, extricator)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
  });

  it("transforms in your upkeep with delirium, and the back face sacrifices a non-Eldrazi", () => {
    const { game } = table();
    const extricator = spawn(game, "Extricator of Sin");
    delirium(game);
    toStep(game, "precombat-main");
    expect(pt(game, extricator)).toEqual({ power: 3, toughness: 5 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    // Itself an Eldrazi now, it can't pay with itself.
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: extricator, abilityIndex: 0, targets: [], sacrifice: extricator }),
    ).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: extricator, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    const horror = named(game, "Eldrazi Horror Token", A)[0];
    expect(keywords(game, horror).has("vigilance")).toBe(true);
  });
});

describe("Ruthless Disposal", () => {
  it("discards, sacrifices, and gives two creatures -13/-13", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const fodder = spawn(game, "Grizzly Bears");
    const one = spawn(game, "Craw Wurm", B);
    const two = spawn(game, "Grizzly Bears", B);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Ruthless Disposal"), { targets: [ref(one), ref(two)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("Galvanic Bombardment", () => {
  it("deals 2 plus one for each Galvanic Bombardment in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Galvanic Bombardment");
    toGraveyard(game, "Galvanic Bombardment");
    toGraveyard(game, "Galvanic Bombardment", B);
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Galvanic Bombardment"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Whispers of Emrakul", () => {
  it("discards two at random with delirium", () => {
    const { game } = table();
    delirium(game);
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Whispers of Emrakul"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("discards one without", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Whispers of Emrakul"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Stromkirk Condemned", () => {
  it("pumps your Vampires once each turn", () => {
    const { game } = table();
    const condemned = spawn(game, "Stromkirk Condemned");
    const feaster = spawn(game, "Dusk Feaster");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, condemned, 0);
    expect(hand(game, A).length).toBe(before - 1);
    expect(pt(game, condemned)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, feaster)).toEqual({ power: 5, toughness: 6 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, condemned, 0)).toThrow();
  });
});

describe("Advanced Stitchwing", () => {
  it("returns from the graveyard tapped for {2}{U} and two discards", () => {
    const { game } = table();
    const stitchwing = toGraveyard(game, "Advanced Stitchwing");
    lands(game, "Island", 3);
    const before = hand(game, A).length;
    activate(game, stitchwing, 0);
    expect(zone(game, stitchwing)).toBe("battlefield");
    expect(game.state.objects[stitchwing].tapped).toBe(true);
    expect(hand(game, A).length).toBe(before - 2);
  });
});

describe("Faith Unbroken", () => {
  it("exiles an opponent's creature until it leaves, and pumps the enchanted creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    const aura = toHand(game, "Faith Unbroken");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, wurm)).toBe("exile");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(aura)]);
    settle(game);
    expect(named(game, "Craw Wurm", B)).toHaveLength(1);
  });
});
